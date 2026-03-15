using FluentValidation;

namespace SiesaAgents.Application.Clientes.Commands;

public class UpdateClienteCommandValidator : AbstractValidator<UpdateClienteCommand>
{
    public UpdateClienteCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("Id es requerido.");
        RuleFor(x => x.Nombre).NotEmpty().WithMessage("Nombre es requerido.").MaximumLength(255);
        RuleFor(x => x.Nit).NotEmpty().WithMessage("NIT/RUC es requerido.").MaximumLength(100);
        RuleFor(x => x.Telefono).NotEmpty().WithMessage("Teléfono es requerido.").MaximumLength(50);
        RuleFor(x => x.Ciudad).NotEmpty().WithMessage("Ciudad es requerida.").MaximumLength(100);
    }
}
