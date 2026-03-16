using FluentValidation;
using SiesaAgents.Application.Contactos.DTOs;

namespace SiesaAgents.Application.Contactos.Validators;

public class AssignContactoClienteRequestValidator : AbstractValidator<AssignContactoClienteRequest>
{
    public AssignContactoClienteRequestValidator()
    {
        // ClienteId is nullable — null means disassociate, valid uuid means associate.
        // No additional rules needed: Guid? binding rejects non-GUID values at model binding.
    }
}
