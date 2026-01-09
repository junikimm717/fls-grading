source "amazon-ebs" "grader_x86" {
  region        = var.region
  instance_type = "t3.small"
  ami_name = "fls-grader-x86-${formatdate("YYYYMMDDhhmmss", timestamp())}"

  tags = {
    fls-role = "grader"
    arch     = "x86"
  }

  launch_block_device_mappings {
    device_name           = "/dev/sda1"
    volume_size           = 40
    volume_type           = "gp3"
    delete_on_termination = true
  }

  source_ami_filter {
    filters = {
      name                = "ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"
      virtualization-type = "hvm"
      root-device-type    = "ebs"
    }
    owners      = ["099720109477"]
    most_recent = true
  }

  ssh_username = "ubuntu"
}

build {
  sources = ["source.amazon-ebs.grader_x86"]

  provisioner "shell" {
    script           = "provision.sh"
    execute_command  = "sudo -E bash '{{ .Path }}'"
  }
}
