variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "ca-central-1"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "smart-ai-tracker"
}

variable "bedrock_model_id" {
  description = "Bedrock foundation model ID"
  type        = string
  default     = "us.amazon.nova-2-lite-v1:0"
}

variable "firebase_project_id" {
  description = "Firebase project ID for ID token verification"
  type        = string
  default     = "prog8111-f830f"
}
