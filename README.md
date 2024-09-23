# Exploration DDD et Clean Architecture en Backend

Projet explorant les concepts du Domain Driven Design (DDD) et de la clean architecture dans un backend NodeJS.

## Objectifs

- Comprendre le Domain Driven Design (DDD).
- Appliquer les principes de la clean architecture / architecture hexagonale.
- Mettre en place 2 frameworks différents, [NestJS](https://nestjs.com/) et [AdonisJS](https://adonisjs.com/):
  - sans changer le code métier de l'application,
  - en respectant autant que possible la philosophie du framework.

## Limitations

Etant donné qu'il s'agit d'un exercice et pas une application réelle, certains aspects sont volontairement ignorés, tels que l'authentification ou les réponses HTTP en cas d'erreur.

Par ailleurs, afin de pratiquer le maximum de techniques de découplage, la conception est plus complexe que nécessaire alors qu'on ferait preuve de pragmatisme pour une application réelle.

## Déroulement

Le projet a été initialement développé avec NestJS afin de structurer et tester les concepts, en appliquant une démarche de Test Driven Development (TDD).

Ensuite, une migration vers AdonisJS a été réalisée, en conservant le même code métier.
