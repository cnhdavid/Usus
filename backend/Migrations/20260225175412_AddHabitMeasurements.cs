using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Usus.API.Migrations
{
    /// <inheritdoc />
    public partial class AddHabitMeasurements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "Habits",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "TargetValue",
                table: "Habits",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Unit",
                table: "Habits",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Value",
                table: "DailyLogs",
                type: "float",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Category",
                table: "Habits");

            migrationBuilder.DropColumn(
                name: "TargetValue",
                table: "Habits");

            migrationBuilder.DropColumn(
                name: "Unit",
                table: "Habits");

            migrationBuilder.DropColumn(
                name: "Value",
                table: "DailyLogs");
        }
    }
}
