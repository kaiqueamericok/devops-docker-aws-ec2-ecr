# Deploy de Website com Docker na AWS (EC2 + ECR)

Esse é um projeto prático de Devops/Cloud, o objetivo é mostrar o ciclo de containerização
do início ao deploy. Para isso foi criada uma aplicação web, essa aplicação é uma calculadora
de custos de Cloud. Como a ideia desse projeto esta focada no deploy da aplicação, a calculadora
foi projetada para ser uma aplicação de web estática na AWS. O deploy da aplicação na AWS utiliza
Docker, Amazon ECR e EC2


## 🎯 Objetivo

Demonstrar na prática o fluxo:
1. Containerizar uma aplicação web com Docker
2. Publicar a imagem no Amazon ECR (Elastic Container Registry)
3. Provisionar uma instância EC2
4. Executar o container na EC2 e expor a aplicação publicamente

## 🛠️ Tecnologias utilizadas

- **Docker** — containerização da aplicação
- **AWS EC2** — hospedagem do container
- **AWS ECR** — registry privado de imagens
- **AWS IAM** — permissões e credenciais
- **Linux (Amazon Linux 2)** — SO da instância
- **HTML/CSS/JS** — aplicação web estática

## 🏗️ Arquitetura


[LOCAL] Dockerfile
       │
       ▼
Docker Image
       │ docker push
       ▼
[AWS ECR] ── docker pull ──► [AWS EC2]
                              │
                              ▼
                       Docker Container
                              │
                              ▼
                         🌐 Website

## Passo a passo do docker ao deploy 

### 1.Containerização local

```bash
docker build -t meu-site:v1.0 .
docker run -d -p 8080:80 meu-site:v1.0 
```

Docker build: Utilizado para criar a imagem a partir do Dockerfile com o "-t" definimos uma tag. 
Docker run: Utilizado para criar um novo container a partir de uma imagem

### 2. Docker push no AMAZON ECR
Acessar o ECR pelo painel do amazon e criar o repositório 
aws ecr create-repository --repository-name meu-site:v1.0

Fazer login no ECR o codigo abaixo solicita uma senha e envia para o docker login.
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-2.amazonaws.com/calc_cloud:v1.0

Cria um "novo nome" para a mesma iamgem e associa a tag para o endereço do repositório ECR 
docker tag meu-site:v1.0 <account-id>.dkr.ecr.us-east-2.amazonaws.com/calc_cloud:v1.0

Envia a imagem para o ECR
docker push <account-id>..dkr.ecr.us-east-2.amazonaws.com/calc_cloud:v1.0

### 3. Provisionamento da EC2 

Nessa etapa vamos utilizar o EC2 (Elastic Compute Cloud). É o serviço da AWS que permite criar e utilizar servidores virtuais na nuvem.

*Instância Amazon Linux 2 (t2.micro — free tier)
*Security Group liberando porta 80 (HTTP) e 22 (SSH)
*Par de chaves configurado para acesso SSH

### 4. Deploy na EC2

ssh -i minha-chave.pem ec2-user@<ip-publico>
sudo yum install -y docker
sudo systemctl start docker
aws ecr get-login-password --region us-east-1 | sudo docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
sudo docker pull <account-id>.dkr.ecr.us-east-1.amazonaws.com/website-devops:latest
sudo docker run -d -p 80:80 <account-id>.dkr.ecr.us-east-1.amazonaws.com/website-devops:latest

✅Resultado
Aplicação acessível publicamente via IP da EC2.
Veja prints em docs/images/.

👤 Autor
Kaique Matheus Vieira Americo

LinkedIn: https://www.linkedin.com/in/kaiqueamerico/

GitHub: github.com/Kaiqueamericok
