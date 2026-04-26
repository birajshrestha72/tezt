using Microsoft.EntityFrameworkCore;
using VehiclePartsAPI.Data;
using VehiclePartsAPI.Models;

namespace VehiclePartsAPI.Services
{
    public interface IPartService
    {
        Task<IEnumerable<Part>> GetAllParts();
        Task<Part> CreatePart(Part part);
        Task<Part> UpdatePart(Part part);
        Task<bool> DeletePart(Guid id);
        Task<int> GetPartCount();
    }

    public class PartService : IPartService
    {
        private readonly AppDbContext _context;

        public PartService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Part>> GetAllParts()
        {
            return await _context.Parts.ToListAsync();
        }

        public async Task<Part> CreatePart(Part part)
        {
            part.Id = Guid.NewGuid();
            _context.Parts.Add(part);
            await _context.SaveChangesAsync();
            return part;
        }

        public async Task<Part> UpdatePart(Part part)
        {
            var existingPart = await _context.Parts.FindAsync(part.Id);
            if (existingPart == null) return null;

            existingPart.Name = part.Name;
            existingPart.Sku = part.Sku;
            existingPart.UnitPrice = part.UnitPrice;
            existingPart.CostPrice = part.CostPrice;
            existingPart.StockQty = part.StockQty;
            existingPart.ReorderLevel = part.ReorderLevel;
            existingPart.Description = part.Description;

            await _context.SaveChangesAsync();
            return existingPart;
        }

        public async Task<bool> DeletePart(Guid id)
        {
            var part = await _context.Parts.FindAsync(id);
            if (part == null) return false;
            _context.Parts.Remove(part);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> GetPartCount()
        {
            return await _context.Parts.CountAsync();
        }
    }
}
