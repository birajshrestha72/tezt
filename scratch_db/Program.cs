using System;
using System.Data;
using Npgsql;

namespace DbQuery
{
    class Program
    {
        static void Main(string[] args)
        {
            try
            {
                string connString = "Host=localhost;Database=vehicleparts_db;Username=postgres;Password=0000";
                using var conn = new NpgsqlConnection(connString);
                conn.Open();

                using var cmd = new NpgsqlCommand("SELECT id, email, password_hash FROM users", conn);
                using var reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    Console.WriteLine($"Email: {reader.GetString(1)}, Password: {reader.GetString(2)}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }
    }
}
