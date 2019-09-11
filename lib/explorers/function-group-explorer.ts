import { ClassDeclaration, Decorator, Project, StringLiteral } from 'ts-morph';
import { FunctionGroupDeclaration } from '../interfaces/function-group-declaration.interface';

export class FunctionGroupExplorer {
  getFunctionGroupDeclaration(
    path: string,
    project: Project,
  ): FunctionGroupDeclaration | undefined {
    const file = project.getSourceFile(path);
    if (!file) {
      throw new Error(`"${path}" does not exist in this project`);
    }
    const clazz: ClassDeclaration = file.getClasses()[0];
    if (!clazz) {
      return;
    }
    const fnDecoratorRef = clazz.getDecorator('FunctionGroup');
    const moduleDecoratorRef = clazz.getDecorator('Module');
    const isFunctionGroupClass = fnDecoratorRef && moduleDecoratorRef;
    if (!isFunctionGroupClass) {
      return;
    }

    const callExpression = (fnDecoratorRef as Decorator).getCallExpression();
    if (!callExpression) {
      return;
    }
    const expressionArguments = callExpression.getArguments();
    const functionName = expressionArguments[0];
    return {
      path,
      entryModule: clazz.getName() as string,
      name:
        (functionName && (functionName as StringLiteral).getLiteralText()) ||
        clazz.getName(),
    } as FunctionGroupDeclaration;
  }
}
