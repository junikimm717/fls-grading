variable "region" {
  type    = string
  default = "us-east-1"
}

variable "x86_workers" {
  type      = map(string)
  sensitive = true
}

variable "arm_workers" {
  type      = map(string)
  sensitive = true
}

variable "x86_worker_names" {
  type = set(string)
}

variable "arm_worker_names" {
  type = set(string)
}
