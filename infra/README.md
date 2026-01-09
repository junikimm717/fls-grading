# Infrastructure for Grading Fleet

Because I discovered that clicking buttons on AWS is a pain in the ass.

No one except the project creator is expected to invoke any of the code in this
project.

You need terraform and packer installed.

## Creating AMI's

```bash
cd ./packer
packer init .
packer build .
```

## Deploying the Fleet

```bash
cd ./terraform
cp workers.auto.tfvars.example workers.auto.tfvars
# after editing the workers.auto.tfvars with the API keys
terraform init
terraform apply
```

## Destroying the Fleet

```bash
cd ./terraform
terraform destroy
```
