provider "aws" {
	region = "us-east-2"
	shared_credentials_file = "/run/secrets/aws-administrator-credentials"
}

data "aws_caller_identity" "current" {}




################################################# VPC/ Networking #################################################
module "vpc" {
	source = "terraform-aws-modules/vpc/aws"

	name = "us-east-2-vpc"

	/*
	Subnet allocation reasoning is outlined in this article:
	https://medium.com/aws-activate-startup-blog/practical-vpc-design-8412e1a18dcc

	10.0.0.0/16:
			10.0.0.0/18 - AZ A
					10.0.0.0/19 - Private
					10.0.32.0/19
							10.0.32.0/20 - Public
							10.0.48.0/20 - Spare
			10.0.64.0/18 - AZ B
					10.0.64.0/19 - Private
					10.0.96.0/19
									10.0.96.0/20 - Public
									10.0.112.0/20 - Spare
			10.0.128.0/18 - AZ C
					10.0.128.0/19 - Private
					10.0.160.0/19
									10.0.160.0/20 - Public
									10.0.176.0/20 - Spare
			10.0.192.0/18 - Spare
	*/
	cidr = "10.0.0.0/16"
	azs = ["us-east-2a", "us-east-2b", "us-east-2c"]
	// private_subnets = ["10.0.0.0/19", "10.0.64.0/19", "10.0.128.0/19"]
	public_subnets = ["10.0.48.0/20", "10.0.112.0/20", "10.0.176.0/20"]

	//enable_nat_gateway = true

	tags = {
		Environment = "dev"
		Name = "us-east-2-vpc"
	}
}


#Security Group Setup
resource "aws_security_group" "app_server" {
	name        = "app-server"
	description = "Allow all inbound/ outbound traffic"
	vpc_id      = "${module.vpc.vpc_id}"

	ingress {
		from_port   = 0
		to_port     = 0
		protocol    = "-1"
		cidr_blocks = ["0.0.0.0/0"]
	}

	egress {
		from_port       = 0
		to_port         = 0
		protocol        = "-1"
		cidr_blocks     = ["0.0.0.0/0"]
	}
}

resource "aws_security_group" "alb" {
	name        = "alb"
	description = "Allow all inbound/ outbound traffic"
	vpc_id      = "${module.vpc.vpc_id}"

	ingress {
		from_port   = 0
		to_port     = 0
		protocol    = "-1"
		cidr_blocks = ["0.0.0.0/0"]
	}

	egress {
		from_port       = 0
		to_port         = 0
		protocol        = "-1"
		cidr_blocks     = ["0.0.0.0/0"]
	}
}





#################################################### IAM/ Security ####################################################

# IAM setup for the container instances
resource "aws_iam_role" "container_instance" {
  name               = "container-instance"
  assume_role_policy = "${data.aws_iam_policy_document.container_instance.json}"
}

# This allows the role to be assumed by EC2 resources
data "aws_iam_policy_document" "container_instance" {
  statement {
		effect = "Allow"

    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

# This lets our EC2 instance (really the ECS agent running on it) do ECS things,
# like communicate with the cluser etc
resource "aws_iam_role_policy_attachment" "container_instance" {
  role       = "${aws_iam_role.container_instance.name}"
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

# The instance profile is a container that lets the applications running on EC2 instances
# access the temporary credentials of the role which is actually assigned to the EC2 resource itself.
resource "aws_iam_instance_profile" "container_instance" {
  name = "${aws_iam_role.container_instance.name}"
  role = "${aws_iam_role.container_instance.name}"
}





# IAM setup for the ECS Service
resource "aws_iam_role" "ecs_service" {
  name               = "ecs-service"
  assume_role_policy = "${data.aws_iam_policy_document.ecs_service.json}"
}

# This allows the role to be assumed by ECS resources
data "aws_iam_policy_document" "ecs_service" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["ecs.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

# This allows the ECS service scheduler makes calls to EC2 and ELB
resource "aws_iam_role_policy_attachment" "ecs_service" {
  role       = "${aws_iam_role.ecs_service.name}"
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceRole"
}


# The app server ECS tasks are going to need access to an API key for google maps
# which is encryped in AAM parameter store, so we need a role/policy for fetching and decrypting the key
resource "aws_iam_role" "app_server_ecs_task" {
  name               = "app-server-ecs-task"
  assume_role_policy = "${data.aws_iam_policy_document.ecs_task.json}"
}

# This allows the role to be assumed by ECS
data "aws_iam_policy_document" "ecs_task" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role_policy_attachment" "app_server_maps_api_key_retrieval" {
  role       = "${aws_iam_role.app_server_ecs_task.name}"
  policy_arn = "${aws_iam_policy.maps_api_key_retrieval.arn}"
}

resource "aws_iam_policy" "maps_api_key_retrieval" {
  name   = "maps_api_key_retrieval"
  path   = "/"
  policy = "${data.aws_iam_policy_document.maps_api_key_retrieval.json}"
}

data "aws_iam_policy_document" "maps_api_key_retrieval" {
  statement {
    effect = "Allow"

    actions = [
      "ssm:DescribeParameters"
    ]

    resources = [
      "*"
    ]
  }

  statement {
    effect = "Allow"

    actions = [
      "ssm:GetParameters"
    ]

    resources = [
      "${aws_ssm_parameter.maps_api_key.arn}",
    ]
  }

  statement {
    effect = "Allow"

    actions = [
      "kms:Decrypt"
    ]

    resources = [
      "${data.aws_kms_key.default_ssm_key.arn}"
    ]
  }
}

data "aws_kms_key" "default_ssm_key" {
  key_id = "alias/aws/ssm"
}


# Store the Maps API key as an encryped SSM parameter store value
data "local_file" "maps_api_key_file" {
  filename = "/run/secrets/maps-api-key"
}

resource "aws_ssm_parameter" "maps_api_key" {
  name  = "maps_api_key"
  description  = "API key for making calls to the google maps API"
  type  = "SecureString"
  value = "${data.local_file.maps_api_key_file.content}"
}





# Task Definition for the app server
data "template_file" "app_server_task_definition" {
  template = "${file("${path.module}/app-server-task-definition.json")}"
}

resource "aws_ecs_task_definition" "app_server" {
  family                   = "app-server"
  container_definitions    = "${data.template_file.app_server_task_definition.rendered}"
  task_role_arn            = "${aws_iam_role.app_server_ecs_task.arn}"
  requires_compatibilities = ["EC2"]
  network_mode             = "awsvpc"
  cpu                      = "256"
  memory                   = "300"
}







######################################################### ECS #########################################################

# Create the cluster
resource "aws_ecs_cluster" "main" {
	name = "main-cluster"
}





# create the App Server ECS service
resource "aws_ecs_service" "app_server" {
  name             = "app-server"
  task_definition  = "${aws_ecs_task_definition.app_server.family}:${aws_ecs_task_definition.app_server.revision}"
  desired_count    = 3
  launch_type      = "EC2"
  cluster          = "${aws_ecs_cluster.main.id}"

  network_configuration {
    security_groups = ["${aws_security_group.app_server.id}"]
    subnets         = ["${module.vpc.public_subnets}"]
  }

	# Spread tasks evenly across EC2 instances in the cluster
	ordered_placement_strategy {
		type  = "spread"
		field = "instanceId"
	}

	load_balancer {
    target_group_arn = "${aws_lb_target_group.target-group.arn}"
    container_name   = "app_server"
    container_port   = 80
  }
}






# Create an auto-scaling group and launch configuration for the EC2 instances
data "aws_ami" "ecs_optimized" {
  filter {
    name = "name"
    values = ["amzn-ami-2018.03.a-amazon-ecs-optimized"]
  }
}

data "template_file" "user_data" {
  template = "${file("${path.module}/user_data.yaml")}"

  vars {
    cluster_name = "${aws_ecs_cluster.main.name}"
  }
}

resource "aws_autoscaling_group" "app_server" {
  name = "app-server"
  vpc_zone_identifier  = ["${module.vpc.public_subnets}"]
  launch_configuration = "${aws_launch_configuration.app_server.name}"

  desired_capacity = 3
  min_size = 3
  max_size = 6
}

resource "aws_launch_configuration" "app_server" {
  name                 = "app-server"
  image_id             = "${data.aws_ami.ecs_optimized.id}"
  iam_instance_profile = "${aws_iam_instance_profile.container_instance.name}"
  security_groups      = ["${aws_security_group.app_server.id}"]
  key_name             = "administrator-key-pair-useast2"
  user_data            = "${data.template_file.user_data.rendered}"
  instance_type = "t2.micro"
}





# Set up an application load balancer
resource "aws_lb" "load-balancer" {
	name                = "load-balancer"
	load_balancer_type  = "application"
	security_groups     = ["${aws_security_group.alb.id}"]
	subnets             = ["${module.vpc.public_subnets}"]

	tags {
		Name = "load-balancer"
	}
}

resource "aws_lb_target_group" "target-group" {
    name                = "target-group"
    port                = "80"
    protocol            = "HTTP"
    vpc_id              = "${module.vpc.vpc_id}"
		target_type         = "ip"

    health_check {
			healthy_threshold   = "5"
			unhealthy_threshold = "2"
			interval            = "30"
			matcher             = "200"
			path                = "/"
			port                = "traffic-port"
			protocol            = "HTTP"
			timeout             = "5"
    }

    tags {
      Name = "target-group"
    }

		depends_on = [
			"aws_lb.load-balancer",
		]
}

resource "aws_lb_listener" "listener" {
	load_balancer_arn = "${aws_lb.load-balancer.arn}"
	port              = "80"
	protocol          = "HTTP"

	default_action {
		target_group_arn = "${aws_lb_target_group.target-group.arn}"
		type             = "forward"
	}
}




/*

#
# Security group resources
#
resource "aws_security_group" "container_instance" {
  vpc_id = "${var.vpc_id}"

  tags {
    Name        = "sgContainerInstance"
    Project     = "${var.project}"
    Environment = "${var.environment}"
  }
}











resource "aws_security_group" "rethinkdb" {
	name        = "allow_all"
	description = "Allow all inbound/ outbound traffic"
	vpc_id      = "${aws_vpc.main.id}"

	ingress {
		from_port   = 0
		to_port     = 0
		protocol    = "-1"
		cidr_blocks = ["0.0.0.0/0"]
	}

	egress {
		from_port       = 0
		to_port         = 0
		protocol        = "-1"
		cidr_blocks     = ["0.0.0.0/0"]
	}
}





resource "aws_ecs_service" "rethinkdb" {
	name            = "rethinkdb"
	cluster         = "${aws_ecs_cluster.main.id}"
	task_definition = "${aws_ecs_task_definition.rethinkdb.arn}"
	desired_count   = 3
	iam_role        = "${aws_iam_role.rethinkdb.arn}"
	depends_on      = ["aws_iam_role_policy.rethinkdb"]

	# Spread tasks evenly across EC2 instances in the cluster
	ordered_placement_strategy {
		type  = "spread"
		field = "instanceId"
	}

	networking_constraints {
		subnets = "${modules.vpc.public_subnets}"
		security_groups = ["${aws_security_group.rethinkdb}"]
		assign_public_ip = false
	}
}



















data "aws_ami" "ecs_optimized" {
  filter {
    name = "name"
    values = ["amzn-ami-2017.09.l-amazon-ecs-optimized"]
  }
}

data "template_file" "user_data" {
  template = "${file("${module.path}/user_data.yaml")}"

  vars {
    ecs_cluster = "main"
  }
}

resource "aws_autoscaling_group" "rethinkdb" {
  name = "rethinkdb"
  vpc_zone_identifier  = ["${module.vpc.public_subnets}"]
  launch_configuration = "${aws_launch_configuration.rethinkdb.name}"

  desired_capacity = 3
  min_size = 3
  max_size = 6
}

resource "aws_launch_configuration" "rethinkdb" {
  name                 = "rethinkdb"
  image_id             = "${data.aws_ami.ecs_optimized.id}"
  iam_instance_profile = "${aws_iam_instance_profile.container_instance.name}"
  security_groups      = ["${aws_security_group.allow_all.id}"]
  user_data            = "${data.template_file.user_data.rendered}"
  instance_type = "t2.micro"
}

*/
