using System;
using System.Text.Json;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IELTS_System.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "public");

            migrationBuilder.CreateTable(
                name: "test_types",
                schema: "public",
                columns: table => new
                {
                    test_type_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    description = table.Column<string>(type: "character varying(10000)", maxLength: 10000, nullable: true),
                    time_limit = table.Column<int>(type: "integer", nullable: false),
                    total_marks = table.Column<int>(type: "integer", nullable: false),
                    instructions = table.Column<string>(type: "character varying(10000)", maxLength: 10000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_test_types", x => x.test_type_id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                schema: "public",
                columns: table => new
                {
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    password_hash = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    first_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    last_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    date_of_birth = table.Column<DateOnly>(type: "date", nullable: false),
                    country = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    registration_date = table.Column<DateOnly>(type: "date", nullable: false),
                    last_login = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    user_role = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    profile_image_path = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.user_id);
                });

            migrationBuilder.CreateTable(
                name: "tests",
                schema: "public",
                columns: table => new
                {
                    test_id = table.Column<Guid>(type: "uuid", nullable: false),
                    test_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    test_type_id = table.Column<Guid>(type: "uuid", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    creation_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    last_updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    audio_path = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tests", x => x.test_id);
                    table.ForeignKey(
                        name: "FK_tests_test_types_test_type_id",
                        column: x => x.test_type_id,
                        principalSchema: "public",
                        principalTable: "test_types",
                        principalColumn: "test_type_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "test_parts",
                schema: "public",
                columns: table => new
                {
                    part_id = table.Column<Guid>(type: "uuid", nullable: false),
                    test_id = table.Column<Guid>(type: "uuid", nullable: false),
                    part_number = table.Column<int>(type: "integer", nullable: false),
                    title = table.Column<string>(type: "character varying(10000)", maxLength: 10000, nullable: true),
                    description = table.Column<string>(type: "character varying(10000)", maxLength: 10000, nullable: true),
                    content = table.Column<string>(type: "character varying(10000)", maxLength: 10000, nullable: false),
                    image_path = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_test_parts", x => x.part_id);
                    table.ForeignKey(
                        name: "FK_test_parts_tests_test_id",
                        column: x => x.test_id,
                        principalSchema: "public",
                        principalTable: "tests",
                        principalColumn: "test_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_tests",
                schema: "public",
                columns: table => new
                {
                    user_test_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    test_id = table.Column<Guid>(type: "uuid", nullable: false),
                    start_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    num_correct_answer = table.Column<int>(type: "integer", nullable: false),
                    feedback = table.Column<string>(type: "character varying(10000)", maxLength: 10000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_tests", x => x.user_test_id);
                    table.ForeignKey(
                        name: "FK_user_tests_tests_test_id",
                        column: x => x.test_id,
                        principalSchema: "public",
                        principalTable: "tests",
                        principalColumn: "test_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_user_tests_users_user_id",
                        column: x => x.user_id,
                        principalSchema: "public",
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "sections",
                schema: "public",
                columns: table => new
                {
                    section_id = table.Column<Guid>(type: "uuid", nullable: false),
                    part_id = table.Column<Guid>(type: "uuid", nullable: false),
                    section_number = table.Column<int>(type: "integer", nullable: false),
                    instructions = table.Column<string>(type: "character varying(10000)", maxLength: 10000, nullable: true),
                    question_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    image_path = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sections", x => x.section_id);
                    table.ForeignKey(
                        name: "FK_sections_test_parts_part_id",
                        column: x => x.part_id,
                        principalSchema: "public",
                        principalTable: "test_parts",
                        principalColumn: "part_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "questions",
                schema: "public",
                columns: table => new
                {
                    question_id = table.Column<Guid>(type: "uuid", nullable: false),
                    section_id = table.Column<Guid>(type: "uuid", nullable: false),
                    question_number = table.Column<int>(type: "integer", nullable: false),
                    content = table.Column<JsonDocument>(type: "jsonb", nullable: false),
                    marks = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_questions", x => x.question_id);
                    table.ForeignKey(
                        name: "FK_questions_sections_section_id",
                        column: x => x.section_id,
                        principalSchema: "public",
                        principalTable: "sections",
                        principalColumn: "section_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "answers",
                schema: "public",
                columns: table => new
                {
                    answer_id = table.Column<Guid>(type: "uuid", nullable: false),
                    question_id = table.Column<Guid>(type: "uuid", nullable: false),
                    correct_answer = table.Column<string>(type: "character varying(10000)", maxLength: 10000, nullable: false),
                    explanation = table.Column<string>(type: "character varying(10000)", maxLength: 10000, nullable: true),
                    alternative_answers = table.Column<string>(type: "character varying(10000)", maxLength: 10000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_answers", x => x.answer_id);
                    table.ForeignKey(
                        name: "FK_answers_questions_question_id",
                        column: x => x.question_id,
                        principalSchema: "public",
                        principalTable: "questions",
                        principalColumn: "question_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_responses",
                columns: table => new
                {
                    response_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_test_id = table.Column<Guid>(type: "uuid", nullable: false),
                    question_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_answer = table.Column<string>(type: "character varying(10000)", maxLength: 10000, nullable: false),
                    marks_rewarded = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_responses", x => x.response_id);
                    table.ForeignKey(
                        name: "FK_user_responses_questions_question_id",
                        column: x => x.question_id,
                        principalSchema: "public",
                        principalTable: "questions",
                        principalColumn: "question_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_user_responses_user_tests_user_test_id",
                        column: x => x.user_test_id,
                        principalSchema: "public",
                        principalTable: "user_tests",
                        principalColumn: "user_test_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_answers_question_id",
                schema: "public",
                table: "answers",
                column: "question_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_questions_section_id",
                schema: "public",
                table: "questions",
                column: "section_id");

            migrationBuilder.CreateIndex(
                name: "IX_sections_part_id",
                schema: "public",
                table: "sections",
                column: "part_id");

            migrationBuilder.CreateIndex(
                name: "IX_test_parts_test_id",
                schema: "public",
                table: "test_parts",
                column: "test_id");

            migrationBuilder.CreateIndex(
                name: "IX_tests_test_type_id",
                schema: "public",
                table: "tests",
                column: "test_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_responses_question_id",
                table: "user_responses",
                column: "question_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_responses_user_test_id",
                table: "user_responses",
                column: "user_test_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_tests_test_id",
                schema: "public",
                table: "user_tests",
                column: "test_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_tests_user_id",
                schema: "public",
                table: "user_tests",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "answers",
                schema: "public");

            migrationBuilder.DropTable(
                name: "user_responses");

            migrationBuilder.DropTable(
                name: "questions",
                schema: "public");

            migrationBuilder.DropTable(
                name: "user_tests",
                schema: "public");

            migrationBuilder.DropTable(
                name: "sections",
                schema: "public");

            migrationBuilder.DropTable(
                name: "users",
                schema: "public");

            migrationBuilder.DropTable(
                name: "test_parts",
                schema: "public");

            migrationBuilder.DropTable(
                name: "tests",
                schema: "public");

            migrationBuilder.DropTable(
                name: "test_types",
                schema: "public");
        }
    }
}
