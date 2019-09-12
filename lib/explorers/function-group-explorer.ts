import {
  ClassDeclaration,
  Decorator,
  ObjectLiteralExpression,
  Project,
} from 'ts-morph';
import { FunctionGroupDeclaration } from '../interfaces/function-group-declaration.interface';
import { astExpressionToObject } from '../utils/ast-expression-to-object';

const MODULE_DECORATOR_NAME = 'Module';

export class FunctionGroupExplorer {
  getFunctionGroupDeclaration(
    path: string,
    project: Project,
    groupDecoratorName: string,
  ): FunctionGroupDeclaration | undefined {
    const file = project.getSourceFile(path);
    if (!file) {
      throw new Error(`"${path}" does not exist in this project`);
    }
    const clazz: ClassDeclaration = file.getClasses()[0];
    if (!clazz) {
      return;
    }
    const fnDecoratorRef = clazz.getDecorator(groupDecoratorName);
    const moduleDecoratorRef = clazz.getDecorator(MODULE_DECORATOR_NAME);
    const isFunctionGroupClass = fnDecoratorRef && moduleDecoratorRef;
    if (!isFunctionGroupClass) {
      return;
    }

    const callExpression = (fnDecoratorRef as Decorator).getCallExpression();
    if (!callExpression) {
      return;
    }
    const expressionArgs = callExpression.getArguments()[0];
    const { name, ...properties } =
      astExpressionToObject(expressionArgs as ObjectLiteralExpression) ||
      ({} as any);
    const functionName = name || clazz.getName();
    return {
      path,
      entryModule: clazz.getName() as string,
      name: functionName,
      ...properties,
    } as FunctionGroupDeclaration;
  }
}
