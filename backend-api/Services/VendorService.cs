using Microsoft.EntityFrameworkCore;
using VehiclePartsAPI.Data;
using VehiclePartsAPI.Models;

namespace VehiclePartsAPI.Services
{
    public interface IVendorService
    {
        Task<IEnumerable<Vendor>> GetAllVendors();
        Task<Vendor> GetVendorById(Guid id);
        Task<Vendor> CreateVendor(Vendor vendor);
        Task<Vendor> UpdateVendor(Vendor vendor);
        Task<bool> DeleteVendor(Guid id);
    }

    public class VendorService : IVendorService
    {
        private readonly AppDbContext _context;

        public VendorService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Vendor>> GetAllVendors()
        {
            return await _context.Vendors.ToListAsync();
        }

        public async Task<Vendor> GetVendorById(Guid id)
        {
            return await _context.Vendors.FindAsync(id);
        }

        public async Task<Vendor> CreateVendor(Vendor vendor)
        {
            vendor.Id = Guid.NewGuid();
            vendor.ContactPerson = string.IsNullOrEmpty(vendor.ContactPerson) ? "N/A" : vendor.ContactPerson;
            vendor.PanNumber = string.IsNullOrEmpty(vendor.PanNumber) ? $"PAN-{new Random().Next(10000, 99999)}" : vendor.PanNumber;
            _context.Vendors.Add(vendor);
            await _context.SaveChangesAsync();
            return vendor;
        }

        public async Task<Vendor> UpdateVendor(Vendor vendor)
        {
            var existingVendor = await _context.Vendors.FindAsync(vendor.Id);
            if (existingVendor == null) return null;

            existingVendor.Name = vendor.Name;
            existingVendor.Email = vendor.Email;
            existingVendor.Phone = vendor.Phone;
            existingVendor.Address = vendor.Address;
            
            if (!string.IsNullOrEmpty(vendor.ContactPerson)) 
                existingVendor.ContactPerson = vendor.ContactPerson;
                
            if (!string.IsNullOrEmpty(vendor.PanNumber))
                existingVendor.PanNumber = vendor.PanNumber;

            await _context.SaveChangesAsync();
            return existingVendor;
        }

        public async Task<bool> DeleteVendor(Guid id)
        {
            var vendor = await _context.Vendors.FindAsync(id);
            if (vendor == null) return false;

            _context.Vendors.Remove(vendor);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
