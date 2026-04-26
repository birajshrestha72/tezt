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

                using var cmd = new NpgsqlCommand(@"
                    SELECT column_name, data_type 
                    FROM information_schema.columns 
                    WHERE table_name = 'parts';
                ", conn);
                
                using var reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    Console.WriteLine($"{reader.GetString(0)} ({reader.GetString(1)})");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error: " + ex.Message);
            }
        }
    }
}
