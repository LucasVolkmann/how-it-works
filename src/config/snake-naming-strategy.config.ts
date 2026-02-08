import { DefaultNamingStrategy, Table, type NamingStrategyInterface } from "typeorm";
import { snakeCase } from "typeorm/util/StringUtils.js";

export class SnakeNamingStrategy
  extends DefaultNamingStrategy
  implements NamingStrategyInterface
{
  tableName(className: string, customName?: string): string {
    return customName ? customName : snakeCase(className);
  }

  columnName(
    propertyName: string,
    customName: string | undefined,
    embeddedPrefixes: string[]
  ): string {
    const fullName = embeddedPrefixes.concat(customName ?? propertyName).join("_");
    return snakeCase(fullName);
  }

  relationName(propertyName: string): string {
    return snakeCase(propertyName);
  }

  joinColumnName(relationName: string, referencedColumnName: string): string {
    return snakeCase(`${relationName}_${referencedColumnName}`);
  }

  joinTableName(
    firstTableName: string,
    secondTableName: string,
    firstPropertyName: string
  ): string {
    return snakeCase(`${firstTableName}_${firstPropertyName}_${secondTableName}`);
  }

  joinTableColumnName(
    tableName: string,
    propertyName: string,
    columnName?: string
  ): string {
    return snakeCase(`${tableName}_${columnName ?? propertyName}`);
  }

  getTableName(tableOrName: string | Table): string {
    if (typeof tableOrName === "string") {
      return tableOrName;
    }
    return tableOrName.name;
  }

  primaryKeyName(tableOrName: string | Table, columnNames: string[]): string {
    const tableName = this.getTableName(tableOrName);
    const base = `${tableName}_${columnNames.join("_")}_pk`;
    const result = snakeCase(base);
    return result;
  }

  uniqueConstraintName(tableOrName: string | Table, columnNames: string[]): string {
    const tableName = this.getTableName(tableOrName);
    const base = `${tableName}_${columnNames.join("_")}_uk`;
    return snakeCase(base);
  }

  relationConstraintName(tableOrName: string | Table, columnNames: string[]): string {
    const tableName = this.getTableName(tableOrName);
    const base = `${tableName}_${columnNames.join("_")}_fk`;
    return snakeCase(base);
  }

  indexName(tableOrName: string | Table, columnNames: string[]): string {
    const tableName = this.getTableName(tableOrName);
    const base = `${tableName}_${columnNames.join("_")}_idx`;
    return snakeCase(base);
  }
}
