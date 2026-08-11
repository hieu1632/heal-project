using AutoMapper;
using HeaL.API.Models.DTOs;
using HeaL.API.Models.Entities;

namespace HeaL.API.Models.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Product, ProductDto>()
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.Name))
                .ForMember(dest => dest.Price, opt => opt.MapFrom(src => src.ProductSizes.Min(ps => ps.Price)))
                .ForMember(dest => dest.Sizes, opt => opt.MapFrom(src => src.ProductSizes))
                .ForMember(dest => dest.Reviews, opt => opt.MapFrom(src => src.Reviews));

            CreateMap<ProductSize, ProductSizeDto>();
            CreateMap<Review, ReviewDto>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.FullName));

            CreateMap<Category, CategoryDto>();
            CreateMap<CategoryCreateDto, Category>();
            CreateMap<CategoryUpdateDto, Category>()
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<ComboCreateDto, Combo>();
            CreateMap<ComboItemCreateDto, ComboItem>();
            CreateMap<ComboUpdateDto, Combo>();
        }
    }
}