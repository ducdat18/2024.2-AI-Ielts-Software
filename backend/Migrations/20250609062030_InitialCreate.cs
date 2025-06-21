using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IELTS_System.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "marks_rewarded",
                table: "user_responses",
                newName: "marks_awarded");

            migrationBuilder.AlterColumn<string>(
                name: "content",
                schema: "public",
                table: "test_parts",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(10000)",
                oldMaxLength: 10000);

            migrationBuilder.AddColumn<string>(
                name: "content",
                schema: "public",
                table: "sections",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "content",
                schema: "public",
                table: "sections");

            migrationBuilder.RenameColumn(
                name: "marks_awarded",
                table: "user_responses",
                newName: "marks_rewarded");

            migrationBuilder.AlterColumn<string>(
                name: "content",
                schema: "public",
                table: "test_parts",
                type: "character varying(10000)",
                maxLength: 10000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");
        }
    }
}
