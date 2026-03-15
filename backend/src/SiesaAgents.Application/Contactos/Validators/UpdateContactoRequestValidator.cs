using FluentValidation;
using SiesaAgents.Application.Contactos.DTOs;

namespace SiesaAgents.Application.Contactos.Validators;

public class UpdateContactoRequestValidator : AbstractValidator<UpdateContactoRequest>
{
    public UpdateContactoRequestValidator()
    {
        RuleFor(x => x.Nombre).NotEmpty().WithMessage("Nombre es requerido.").MaximumLength(200);
        RuleFor(x => x.Cargo).NotEmpty().WithMessage("Cargo es requerido.").MaximumLength(200);
        RuleFor(x => x.Telefono).NotEmpty().WithMessage("Teléfono es requerido.").MaximumLength(50);
        RuleFor(x => x.Email).NotEmpty().WithMessage("Email es requerido.").EmailAddress().MaximumLength(254);
    }
}
