# Guía QA — Pruebas con Claude sobre Siesa-Agents

> Cómo pedirle a Claude que pruebe la aplicación **Siesa-Agents** por ti.
> **Requisito:** la aplicación debe estar corriendo en `http://localhost:5173` (frontend) y el backend en `http://localhost:5000` antes de usar estos prompts.

---

## Antes de empezar

Si la app no está corriendo, pídele a tu equipo de desarrollo que la levante. El frontend se inicia con:
```
cd frontend && npm run dev
```
El backend (`.NET 10`) se inicia con:
```
cd backend && dotnet run
```

---

## 1. Explorar una pantalla

**Cuándo usarlo:** cuando vas a probar una sección por primera vez y quieres saber qué contiene.

**Prompt — Lista de Clientes:**
> "Abre `http://localhost:5173/clientes` y dime todos los elementos que hay en esa pantalla: campos de búsqueda, botones, columnas de la tabla y opciones disponibles."

**Prompt — Lista de Contactos:**
> "Abre `http://localhost:5173/contactos` y dime todos los elementos que hay en esa pantalla: campos de búsqueda, botones, columnas de la tabla y opciones disponibles."

---

## 2. Verificar que una pantalla carga sin errores

**Cuándo usarlo:** verificación básica de que la pantalla no tiene errores al abrir.

**Prompt:**
> "Abre `http://localhost:5173/clientes` y dime si la lista de clientes carga correctamente, si aparece algún error en pantalla, y si hay errores en la consola del navegador."

> "Abre `http://localhost:5173/contactos` y dime si la lista de contactos carga correctamente, si aparece algún error en pantalla, y si hay errores en la consola del navegador."

---

## 3. Crear un Cliente

**Cuándo usarlo:** validar que el formulario de creación de clientes funciona.

**Prompt:**
> "Abre `http://localhost:5173/clientes`, busca el botón para crear un cliente nuevo y créalo con estos datos: Nombre: `Empresa de Prueba`, NIT: `900123456-1`, Teléfono: `3001234567`, Ciudad: `Bogotá`. Dime si se guardó correctamente y qué mensaje mostró la app."

---

## 4. Crear un Contacto

**Cuándo usarlo:** validar que el formulario de creación de contactos funciona.

**Prompt:**
> "Abre `http://localhost:5173/contactos`, busca el botón para crear un contacto nuevo y créalo con estos datos: Nombre: `Juan Pérez`, Cargo: `Gerente`, Teléfono: `3109876543`, Email: `juan.perez@prueba.com`. Dime si se guardó correctamente y qué mensaje mostró la app."

---

## 5. Probar que los formularios rechazan datos incorrectos

**Cuándo usarlo:** verificar que la app muestra errores de validación cuando los datos están mal o vacíos.

**Prompt — Cliente sin datos:**
> "Abre `http://localhost:5173/clientes`, intenta crear un cliente nuevo sin llenar ningún campo y haz clic en guardar. Dime qué mensajes de error aparecen y en qué campos."

**Prompt — Contacto con email inválido:**
> "Abre `http://localhost:5173/contactos`, intenta crear un contacto poniendo `esto-no-es-un-email` en el campo de Email y dime qué pasa al intentar guardar."

---

## 6. Probar el buscador

**Cuándo usarlo:** verificar que el filtro/búsqueda de la tabla funciona correctamente.

**Prompt — Buscar cliente:**
> "Abre `http://localhost:5173/clientes`, escribe `Empresa` en el campo de búsqueda y dime cuántos resultados aparecen y si coinciden con lo buscado."

**Prompt — Buscar contacto:**
> "Abre `http://localhost:5173/contactos`, escribe `Juan` en el campo de búsqueda y dime cuántos resultados aparecen y si son los correctos."

---

## 7. Ver y editar un registro

**Cuándo usarlo:** verificar que el detalle y la edición de clientes y contactos funcionan.

**Prompt — Editar cliente:**
> "Abre `http://localhost:5173/clientes`, haz clic en el primer cliente de la lista para ver su detalle. Cambia el campo Ciudad a `Medellín` y guarda. Dime si el cambio se guardó correctamente."

**Prompt — Editar contacto:**
> "Abre `http://localhost:5173/contactos`, haz clic en el primer contacto de la lista para ver su detalle. Cambia el campo Cargo a `Director` y guarda. Dime si el cambio se guardó correctamente."

---

## 8. Asignar un Contacto a un Cliente

**Cuándo usarlo:** verificar el flujo de asignación, que es la operación especial de esta entidad.

**Prompt:**
> "Abre `http://localhost:5173/contactos`, entra al detalle del primer contacto que no tenga cliente asignado. Busca la opción para asignarle un cliente, selecciona cualquier cliente de la lista y guarda. Dime si la asignación se guardó correctamente y cómo quedó reflejado en la pantalla."

---

## 9. Eliminar un registro

**Cuándo usarlo:** verificar que la eliminación funciona y que aparece la confirmación antes de borrar.

**Prompt — Eliminar cliente:**
> "Abre `http://localhost:5173/clientes`, busca el cliente `Empresa de Prueba` y elimínalo. Si aparece una ventana de confirmación, confírmala. Dime qué pasó y si el cliente desapareció de la lista."

**Prompt — Eliminar contacto:**
> "Abre `http://localhost:5173/contactos`, busca el contacto `Juan Pérez` y elimínalo. Si aparece una ventana de confirmación, confírmala. Dime qué pasó y si el contacto desapareció de la lista."

---

## 10. Tomar captura como evidencia

**Cuándo usarlo:** documentar el estado de la app o capturar un bug visualmente.

**Prompt:**
> "Abre `http://localhost:5173/clientes`, espera a que cargue la lista completa y toma una captura de pantalla para usar como evidencia del estado actual."

> "Abre `http://localhost:5173/contactos`, entra al detalle del primer contacto y toma una captura de pantalla mostrando todos sus datos."

---

## 11. Revisar errores ocultos (consola + red)

**Cuándo usarlo:** cuando la app se ve bien pero sospechas que algo falla por debajo.

**Prompt:**
> "Abre `http://localhost:5173/clientes`, espera a que cargue la lista y revisa si hay errores en la consola del navegador o si alguna petición al servidor falló. Repórtame cualquier problema que encuentres."

---

## 12. Revisar qué datos se envían al servidor

**Cuándo usarlo:** verificar que la app envía los datos correctos al backend al crear o editar.

**Prompt — Crear cliente y verificar API:**
> "Abre `http://localhost:5173/clientes`, crea un cliente con Nombre: `Cliente API Test`, NIT: `111222333-0`, Teléfono: `3001111111`, Ciudad: `Cali`. Dime qué datos se enviaron al servidor y cuál fue la respuesta (status code y datos retornados)."

**Prompt — Editar y verificar:**
> "Abre `http://localhost:5173/clientes`, entra al detalle del primer cliente, cambia el teléfono a `3009999999` y guarda. Dime qué petición se hizo al servidor y si la respuesta fue exitosa."

---

## 13. Probar flujo completo de Onboarding de Cliente con Contacto

**Cuándo usarlo:** probar el flujo de negocio completo de extremo a extremo.

**Prompt:**
> "Abre `http://localhost:5173` y ejecuta este flujo completo: 1) Crea un cliente con Nombre: `Siesa Test`, NIT: `999888777-1`, Teléfono: `3150000000`, Ciudad: `Bogotá`. 2) Crea un contacto con Nombre: `Ana Torres`, Cargo: `Analista`, Teléfono: `3160000000`, Email: `ana@siesa.com`. 3) Entra al detalle del contacto `Ana Torres` y asígnalo al cliente `Siesa Test`. Al final dime si los tres pasos fueron exitosos y cómo quedó reflejado en la app."

---

## 14. Probar la app en pantalla de celular

**Cuándo usarlo:** verificar que la app se ve bien en pantalla pequeña.

**Prompt:**
> "Simula que estás viendo la app en un celular, abre `http://localhost:5173/clientes` y dime si la tabla de clientes y el buscador se ven bien o si hay algo cortado o difícil de usar. Toma una captura de pantalla."

---

## 15. Generar test automático a partir de un flujo probado

**Cuándo usarlo:** cuando ya verificaste que un flujo funciona y quieres que quede como test de regresión.

**Prompt:**
> "Abre `http://localhost:5173/clientes`, ejecuta el flujo de crear un cliente con datos de prueba y luego eliminarlo. Una vez confirmado que funciona, genera el código de prueba Playwright en TypeScript para automatizar ese flujo."

---

## Combinar prompts para reportar un bug con evidencia completa

Cuando encuentres algo raro, usa estos tres prompts juntos:

```
1. Prompt 10 (captura)  → evidencia visual de cómo se ve el bug
2. Prompt 11 (consola)  → errores internos que no se ven en pantalla
3. Prompt 12 (red)      → datos que se enviaron al servidor y qué respondió
```

Eso te da evidencia suficiente para reportar el bug al equipo de desarrollo.
