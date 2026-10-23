// Ambos analizadores se ejecutan como programas FIJOS dentro de Piston. El código
// a inspeccionar llega por stdin y nunca se evalúa ni se interpola en el programa.
export const pythonConceptParser = `import ast, json, sys
source = json.load(sys.stdin)
def expr(n):
 if isinstance(n, ast.Constant): return {'kind':'literal','value':n.value} if isinstance(n.value,(str,int,float,bool)) else {'kind':'unknown'}
 if isinstance(n, ast.Name): return {'kind':'name','name':n.id}
 if isinstance(n, ast.BinOp): return {'kind':'binary','op':{ast.Add:'+',ast.Sub:'-',ast.Mult:'*'}.get(type(n.op),'?'),'left':expr(n.left),'right':expr(n.right)}
 if isinstance(n, ast.UnaryOp) and isinstance(n.op,(ast.USub,ast.UAdd)): return {'kind':'unary','op':'-' if isinstance(n.op,ast.USub) else '+','left':expr(n.operand)}
 if isinstance(n, ast.Call) and not n.keywords:
  if isinstance(n.func, ast.Name): return {'kind':'call','name':n.func.id,'args':[expr(a) for a in n.args]}
  if isinstance(n.func, ast.Attribute) and n.func.attr=='lower' and not n.args: return {'kind':'call','name':'lower','args':[expr(n.func.value)]}
 return {'kind':'unknown'}
def statement(n):
 if isinstance(n, ast.Assign) and len(n.targets)==1 and isinstance(n.targets[0], ast.Name): return {'kind':'assign','name':n.targets[0].id,'expr':expr(n.value)}
 if isinstance(n, ast.AnnAssign) and isinstance(n.target, ast.Name): return {'kind':'assign','name':n.target.id,'expr':expr(n.value)}
 if isinstance(n, ast.AugAssign) and isinstance(n.target, ast.Name): return {'kind':'assign','name':n.target.id,'expr':{'kind':'binary','op':{ast.Add:'+',ast.Sub:'-',ast.Mult:'*'}.get(type(n.op),'?'),'left':expr(n.target),'right':expr(n.value)}}
 if isinstance(n, ast.Expr) and isinstance(n.value, ast.Call) and isinstance(n.value.func, ast.Name) and n.value.func.id=='print' and len(n.value.args)==1 and not n.value.keywords: return {'kind':'print','expr':expr(n.value.args[0])}
 return {'kind':'unknown'}
try:
 tree=ast.parse(source)
 result=[statement(n) for n in tree.body] if len(source)<=30000 else []
 print(json.dumps(result,allow_nan=False))
except (SyntaxError,ValueError,RecursionError): print('[]')
`;

export const typescriptConceptParser = `declare function require(name: string): any;
const load: (name: string) => any = require;
const fs = load('fs'), path = load('path'), cp = load('child_process');
// tsc pertenece al paquete instalado por runner:setup, no al proyecto web.
const compiler = fs.realpathSync(cp.execFileSync('which', ['tsc'], {encoding:'utf8'}).trim());
const ts = load(path.join(path.dirname(compiler), '../lib/typescript.js'));
const source = JSON.parse(fs.readFileSync(0, 'utf8'));
const tree = ts.createSourceFile('practice.ts', source, ts.ScriptTarget.Latest, true);
function expr(n: any): any {
 if (!n) return {kind:'unknown'};
 if (ts.isParenthesizedExpression(n) || ts.isAsExpression(n)) return expr(n.expression);
 if (ts.isNumericLiteral(n)) return {kind:'literal',value:Number(n.text)};
 if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) return {kind:'literal',value:n.text};
 if (n.kind===ts.SyntaxKind.TrueKeyword || n.kind===ts.SyntaxKind.FalseKeyword) return {kind:'literal',value:n.kind===ts.SyntaxKind.TrueKeyword};
 if (ts.isIdentifier(n)) return {kind:'name',name:n.text};
 if (ts.isBinaryExpression(n)) return {kind:'binary',op:n.operatorToken.getText(tree),left:expr(n.left),right:expr(n.right)};
 if (ts.isPrefixUnaryExpression(n) && [ts.SyntaxKind.MinusToken,ts.SyntaxKind.PlusToken].includes(n.operator)) return {kind:'unary',op:n.operator===ts.SyntaxKind.MinusToken?'-':'+',left:expr(n.operand)};
 if (ts.isCallExpression(n) && ts.isIdentifier(n.expression)) return {kind:'call',name:n.expression.text,args:n.arguments.map(expr)};
 if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression) && n.expression.name.text==='toLowerCase' && !n.arguments.length) return {kind:'call',name:'lower',args:[expr(n.expression.expression)]};
 return {kind:'unknown'};
}
function statement(n: any): any[] {
 if (ts.isVariableStatement(n)) return n.declarationList.declarations.map((d: any)=>({kind:'assign',name:ts.isIdentifier(d.name)?d.name.text:undefined,expr:expr(d.initializer)}));
 if (ts.isEmptyStatement(n)) return [];
 if (ts.isExpressionStatement(n)) {
  const e=n.expression;
  if (ts.isCallExpression(e) && ts.isPropertyAccessExpression(e.expression) && e.expression.expression.getText(tree)==='console' && e.expression.name.text==='log' && e.arguments.length===1) return [{kind:'print',expr:expr(e.arguments[0])}];
  if (ts.isBinaryExpression(e) && ts.isIdentifier(e.left)) {
   const op=e.operatorToken.getText(tree);
   if (op==='=') return [{kind:'assign',name:e.left.text,expr:expr(e.right)}];
   if (['+=','-=','*='].includes(op)) return [{kind:'assign',name:e.left.text,expr:{kind:'binary',op:op[0],left:expr(e.left),right:expr(e.right)}}];
  }
 }
 return [{kind:'unknown'}];
}
console.log(JSON.stringify(source.length<=30000 && !tree.parseDiagnostics.length ? tree.statements.flatMap(statement) : []));
`;
