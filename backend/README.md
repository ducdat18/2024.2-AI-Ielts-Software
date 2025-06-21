# IELTS Online System BackEnd with ASP.NET

**An interactive web application built with ASP.NET Core for practicing IELTS Reading, Listening, Speaking, and Writing tests online.**

---

## Table of Contents

1. [Features](#features)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Project Structure](#project-structure)
6. [Technologies & Libraries](#technologies--libraries)
7. [License](#license)

---

## Features

* **Full IELTS Practice Modules**: Reading, Listening sections with realistic tasks.
* **Email Verification**: Confirm user email addresses upon registration.
* **JWT Authentication & Authorization**: Secure API endpoints with role-based access control.
* **Redis Caching**: Improve performance by caching frequently accessed data.
* **Structured Logging with Serilog**: Centralized, formatted logs to various sinks.
* **Entity Framework Core**: Database access with code-first migrations.

---

## Prerequisites

* [.NET SDK 8.0](https://dotnet.microsoft.com/download)
* [PostgreSQL](https://www.postgresql.org/) or compatible database
* [Redis](https://redis.io/) for distributed caching
* Git CLI

---

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/kazuyuki114/IELTS_System.git
   cd IELTS_System
   ```

2. **Restore .NET packages**

   ```bash
   dotnet restore
   ```

3. **Run database migrations**

   ```bash
   cd src/IELTS.Api
   dotnet ef database update
   ```

4. **Start Redis server**

   ```bash
   cd Redis
   docker-compose up -d
   ```

---

## Usage

1. Open your browser at `https://localhost:5001` (or the URL shown in the console).
2. **Register** a new user—verify your email using the link sent to your inbox.
3. **Log in** to access practice modules and your profile.
4. **Select** a test module and begin the timed simulation.
5. **Submit** answers to view instant scores and explanations.
6. **Dashboard**: Track progress, view past attempts, and analyze your strengths/weaknesses.

---

## Project Structure

```plaintext
IELTS_System/
├── Controllers/            # API controllers handling HTTP requests
├── DTOs/                   # Data Transfer Objects
├── Data/                   # EF Core DbContext & Migrations
├── Extension/              # Extension methods
├── Interfaces/             # Service and repository interfaces
├── Mappers/                # Object mapping configurations (e.g., AutoMapper)
├── Migrations/             # Database migration files
├── Models/                 # Domain models and entities
├── Properties/             # Project properties and AssemblyInfo
├── Redis/                  # Redis cache configuration and helpers
├── Repository/             # Data access implementations
├── Services/               # Business logic and integrations
├── Templates/Email/        # Email templates for verification and notifications
├── Program.cs              # Application entry point and host configuration
├── IELTS_System.csproj     # Project file
├── IELTS_System.sln        # Solution file
├── appsettings.Development.json 
├── .gitignore              # Git ignore rules
├── LICENSE                 # MIT License
├── README.md               # Project documentation
└── IELTS_System.http       # HTTP request collection (for testing APIs)
```

---

## Technologies & Libraries

* **Platform**: ASP.NET Core 8.0
* **ORM**: Entity Framework Core
* **Caching**: StackExchange.Redis
* **Logging**: Serilog (Console, write log files in folder Logs)
* **Authentication**: JWT Bearer Tokens
* **Email**: MailKit & MimeKit for SMTP verification
* **Testing**: xUnit, Moq
* **Containerization**: Docker (Redis, PostgreSQL)

---

## License

This project is licensed under the [MIT License](LICENSE).

---
