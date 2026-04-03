output "api_endpoint" {
  description = "The invoke URL of the API Gateway (use this in the mobile app)"
  value       = "${aws_api_gateway_stage.prod.invoke_url}${aws_api_gateway_resource.parse.path}"
}

output "lambda_function_name" {
  description = "Name of the deployed Lambda function"
  value       = aws_lambda_function.ai_parser.function_name
}
