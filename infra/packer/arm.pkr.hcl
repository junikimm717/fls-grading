source "amazon-ebs" "grader_arm" {
  region        = var.region
  instance_type = "t4g.small"
  ami_name = "fls-grader-arm-${formatdate("YYYYMMDDhhmmss", timestamp())}"

  tags = {
    fls-role = "grader"
    arch     = "arm"
  }

  launch_block_device_mappings {
    device_name           = "/dev/sda1"
    volume_size           = 40
    volume_type           = "gp3"
    delete_on_termination = true
  }

  source_ami_filter {
    filters = {
      name                = "ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-arm64-server-*"
      virtualization-type = "hvm"
      root-device-type    = "ebs"
    }
    owners      = ["099720109477"]
    most_recent = true
  }

  ssh_username = "ubuntu"
}

build {
  sources = ["source.amazon-ebs.grader_arm"]

  provisioner "shell" {
    script           = "provision.sh"
    execute_command  = "sudo -E bash '{{ .Path }}'"
  }
}
