import {
  Expression,
  NullLiteral,
  NumericLiteral,
  ObjectLiteralExpression,
  PropertyAssignment,
  StringLiteral,
} from 'ts-morph';

export function astExpressionToObject(
  literalExpr: ObjectLiteralExpression,
): Record<string, any> | string | null | number {
  if (!literalExpr) {
    return {};
  }
  if (!(literalExpr instanceof ObjectLiteralExpression)) {
    return astExpressionToValue(literalExpr);
  }
  const object: Record<string, any> = {};
  const properties = literalExpr.getProperties() as PropertyAssignment[];
  properties.forEach((property: PropertyAssignment) => {
    const key = property.getName();
    const value = astExpressionToObject(
      property.getInitializer() as ObjectLiteralExpression,
    );
    object[key] = value;
  });
  return object;
}

function astExpressionToValue(expression: Expression) {
  if (expression instanceof StringLiteral) {
    return expression.getLiteralText();
  }
  if (expression instanceof NumericLiteral) {
    return +expression.getText();
  }
  if (expression instanceof NullLiteral) {
    return null;
  }
  return {};
}
