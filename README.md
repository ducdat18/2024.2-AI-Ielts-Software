# 🎯 IELTS Online Practice System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![.NET](https://img.shields.io/badge/.NET-8.0-blue.svg)](https://dotnet.microsoft.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF.svg)](https://vitejs.dev/)

> **AI-Powered IELTS Preparation Platform** - A comprehensive web-based system for practicing all four IELTS skills with intelligent feedback and personalized learning experience.

## 🌟 Overview

The IELTS Online Practice System is a cutting-edge educational platform designed to help students prepare for the International English Language Testing System (IELTS) examination. Built with modern technologies and powered by advanced AI capabilities, this system provides comprehensive practice across all four core IELTS skills: **Listening**, **Reading**, **Speaking**, and **Writing**.

### ✨ Key Features

- 🎧 **Listening Module**: Interactive audio-based comprehension exercises
- 📖 **Reading Module**: Text-based practice with various question types
- 🎤 **Speaking Module**: Topic generation and recording capabilities  
- ✍️ **Writing Module**: AI-powered essay evaluation and sample generation
- 🤖 **Smart AI Integration**: Fine-tuned language models for Writing Task 2
- 📊 **Performance Analytics**: Detailed progress tracking and scoring
- 🔐 **Secure Authentication**: JWT-based user management
- 📱 **Responsive Design**: Optimized for all devices

## 🏗️ Architecture

```
ielts-system/
├── 📁 ai/           # AI models and services (Unicorn)
├── 📁 backend/      # .NET 8 Web API
└── 📁 frontend/     # Vite + TypeScript + React
```

## 👥 Development Team

**Hanoi University of Science and Technology - School of ICT**

| Name | Student ID |
|------|------------|
| Nguyen Trung Kien | 20226052 |
| Ha Minh Duc | 20226027 | 
| Phung Duc Dat | 20226025 | 
| Nguyen Cong Minh | 20226056 |
| Pham Duy Hoang | 20226042 |
| Le Van Hau | 20226038 |

**Supervisor**: Prof. Tran The Hung

## 🛠️ Tech Stack

### Backend (.NET 8)
- **Framework**: ASP.NET Core 8.0
- **Database**: SQL Server with Entity Framework Core
- **Authentication**: JWT Bearer tokens
- **Caching**: Redis
- **Logging**: Serilog
- **API Documentation**: Swagger/OpenAPI

### Frontend (Vite + TypeScript)
- **Build Tool**: Vite 5.0
- **Language**: TypeScript 5.0
- **Framework**: React 18
- **Styling**: Tailwind CSS
- **State Management**: Zustand/Redux Toolkit
- **HTTP Client**: Axios

### AI Infrastructure
- **Platform**: Unicorn AI
- **Models**: Fine-tuned language models for IELTS Writing
- **Services**: Essay evaluation, sample generation
- **Integration**: RESTful API endpoints

## 🚀 Quick Start

### 🔧 Backend Setup

```bash
# Navigate to backend directory
cd backend

# Restore NuGet packages
dotnet restore

# Update database connection string in appsettings.json
# Run database migrations
dotnet ef database update

# Start the API server
dotnet run --project IELTS.API
```

The API will be available at `https://localhost:7001`

### 🎨 Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### 🤖 AI Service Setup

```bash
# Navigate to AI directory
cd ai

# Install Python dependencies
pip install -r requirements.txt

# Configure Unicorn AI credentials
cp .env.example .env
# Edit .env with your API keys

# Start AI service
python main.py
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
dotnet test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

### API Testing
Import the Postman collection from `/docs/api-collection.json`

## 📄 Documentation

- [📋 Software Requirements Specification](./docs/SRS.pdf)
- [🏗️ System Architecture](./docs/architecture.md)
- [🗄️ Database Design](./docs/database-schema.md)
- [🤖 AI Integration Guide](./docs/ai-integration.md)
- [🔧 API Documentation](./docs/api-reference.md)

## 📋 Requirements

### Functional Requirements
- ✅ User authentication & profile management
- ✅ Four IELTS skill practice modules
- ✅ AI-powered Writing Task 2 evaluation
- ✅ Progress tracking & analytics
- ✅ Admin content management

### Non-Functional Requirements
- 🚀 **Performance**: Page load < 3-5 seconds
- 🤖 **AI Response**: Essay evaluation < 30 seconds  
- 👥 **Concurrency**: Support 100+ concurrent users
- ⏱️ **Uptime**: Target 99.5% availability
- 🔒 **Security**: Data encryption & input validation

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Hanoi University of Science and Technology
- School of Information and Communication Technology  
- Software Engineering Course (IT4082E)
- Unicorn AI Platform for AI capabilities

---

<div align="center">
**Built with ❤️ by Team FireFly**
</div>
