resource "aws_db_subnet_group" "main" {
  name       = "apex-rewards-${var.environment}"
  subnet_ids = var.subnet_ids
}

resource "aws_security_group" "rds" {
  name   = "apex-rewards-rds-${var.environment}"
  vpc_id = var.vpc_id
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }
}

resource "aws_db_instance" "main" {
  identifier             = "apex-rewards-${var.environment}"
  engine                 = "postgres"
  engine_version         = "16"
  instance_class         = var.instance_class
  allocated_storage      = 20
  max_allocated_storage  = 100
  db_name                = var.db_name
  username               = var.db_username
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  skip_final_snapshot    = false
  final_snapshot_identifier = "apex-rewards-final-${var.environment}"
  backup_retention_period = 7
  deletion_protection    = true
  tags = { Name = "apex-rewards-rds-${var.environment}" }
}

variable "environment"    { type = string }
variable "vpc_id"         { type = string }
variable "subnet_ids"     { type = list(string) }
variable "db_name"        { type = string }
variable "db_username"    { type = string; sensitive = true }
variable "db_password"    { type = string; sensitive = true }
variable "instance_class" { type = string }

output "endpoint" { value = aws_db_instance.main.endpoint; sensitive = true }
