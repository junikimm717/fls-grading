terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

# Discover vpc and subnets

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# Discover ami's

data "aws_ami" "x86" {
  most_recent = true
  owners      = ["self"]

  filter {
    name   = "tag:fls-role"
    values = ["grader"]
  }

  filter {
    name   = "tag:arch"
    values = ["x86"]
  }
}

data "aws_ami" "arm" {
  most_recent = true
  owners      = ["self"]

  filter {
    name   = "tag:fls-role"
    values = ["grader"]
  }

  filter {
    name   = "tag:arch"
    values = ["arm"]
  }
}

#####################################
# Security Group (no inbound)
#####################################

resource "aws_security_group" "grader" {
  name = "fls-grader"

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

#####################################
# IAM (SSM)
#####################################

resource "aws_iam_role" "grader" {
  name = "fls-grader-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.grader.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "grader" {
  name = "fls-grader-profile"
  role = aws_iam_role.grader.name
}

#####################################
# Architecture metadata
#####################################

locals {
  architectures = {
    x86 = {
      ami_id        = data.aws_ami.x86.id
      instance_type = "c6a.2xlarge"
    }
    arm = {
      ami_id        = data.aws_ami.arm.id
      instance_type = "c7g.2xlarge"
    }
  }

  workers = merge(
    {
      for name in var.x86_worker_names :
      "x86-${name}" => { arch = "x86", name = name }
    },
    {
      for name in var.arm_worker_names :
      "arm-${name}" => { arch = "arm", name = name }
    }
  )
}

#####################################
# Launch Templates
#####################################

resource "aws_launch_template" "grader" {
  for_each = local.architectures

  name_prefix   = "fls-${each.key}-"
  image_id      = each.value.ami_id
  instance_type = each.value.instance_type

  iam_instance_profile {
    name = aws_iam_instance_profile.grader.name
  }
  metadata_options {
    http_tokens   = "required"
    http_endpoint = "enabled"
    http_put_response_hop_limit = 2 
  }

  vpc_security_group_ids = [aws_security_group.grader.id]
}

#####################################
# ASG per worker
#####################################

resource "aws_instance" "worker" {
  for_each = local.workers

  ami           = local.architectures[each.value.arch].ami_id
  instance_type = local.architectures[each.value.arch].instance_type
  subnet_id     = data.aws_subnets.default.ids[0]

  iam_instance_profile = aws_iam_instance_profile.grader.name
  vpc_security_group_ids = [aws_security_group.grader.id]

  metadata_options {
    http_tokens   = "required"
    http_endpoint = "enabled"
    http_put_response_hop_limit = 2 
  }

  user_data = <<EOF
#!/bin/bash
set -euo pipefail

cd /opt/fls

cat >.env <<ENV
FLS_GRADING_SECRET=${each.value.arch == "x86" ? var.x86_workers[each.value.name] : var.arm_workers[each.value.name]}
ENV

docker compose up -d
EOF

  tags = {
    Name         = "fls-${each.key}"
    fls_worker   = each.key
    architecture = each.value.arch
  }
}
