
## Stack Tecnológico

- **Angular:** 18 (Standalone Architecture)
- **Node:** v20.19.0
- **TypeScript**
- **RxJS + Angular Signals**
- **Jest**
- **Arquitectura feature-based**

---

## Arquitectura

### Standalone Angular Architecture
El proyecto utiliza la arquitectura **standalone de Angular 18**, eliminando el uso de módulos pesados y mejorando:

- Lazy loading
- Performance
- Legibilidad
- Escalabilidad
- Simplicidad de configuración

```ts
@Component({
  standalone: true
})
```

---

### Feature-Based Architecture (Arquitectura por funcionalidades)

La estructura está organizada por **dominio / funcionalidad**, no por tipo técnico:

```
src/app/features/products/
  ├── components/
  ├── pages/
  ├── services/
  ├── models/
  ├── validators/
  ├── resolvers/
```

---

Se implementó un **Resolver** para la carga previa de datos:

```ts
export const productsResolver: ResolveFn<Product[]> = ...
```
> En mi experiencia funcionalidad no se aprovecha


## Interceptor Global de Errores

Se implementó un **HttpInterceptor** para el manejo centralizado de excepciones HTTP:

---

## Toast Service

Esto mejora notablemente la experiencia de usuario y desacopla la lógica visual.

---

## Skeleton Loaders

Se implementó un **delay artificial de 2 segundos** para mostrar skeleton loaders y simular carga real:

---

## Testing

```bash
npm run test
npm run test:coverage
```

---

## Instalación

### Requisitos

- Node **v20.19.0**
- Angular CLI **v18**

### Pasos

```bash
npm install
npm run start
```

El proyecto estará disponible en:

```
http://localhost:4200
```


---

## Autor

*Bolivar Tapia*  
Full Stack Developer — AI 
---
