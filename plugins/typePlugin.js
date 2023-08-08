exports.typePlugin = function (analysisContext) {
    const mapName = 'typeMap';
    // 在分析实例上下文挂载副作用
    analysisContext[mapName] = {};

    function isTypeCheck (context, tsCompiler, node, depth, apiName, matchImportItem, filePath, projectName, line) {
        try{
            if(node.parent && tsCompiler.isTypeReferenceNode(node.parent)){                        // 命中Type检测
                if (!context[mapName][apiName]) {
                    context[mapName][apiName] = {};
                    context[mapName][apiName].cN = 1;
                    context[mapName][apiName].as = matchImportItem.origin;
                    context[mapName][apiName].cF = {};
                    context[mapName][apiName].cF[filePath] = {};
                    context[mapName][apiName].cF[filePath].pN = projectName;
                    context[mapName][apiName].cF[filePath].ls = [];
                    context[mapName][apiName].cF[filePath].ls.push(line);
                } else {
                    context[mapName][apiName].cN++;
                    if (!Object.keys(context[mapName][apiName].cF).includes(filePath)) {
                        context[mapName][apiName].cF[filePath] = {};
                        context[mapName][apiName].cF[filePath].pN = projectName;
                        context[mapName][apiName].cF[filePath].ls = [];
                        context[mapName][apiName].cF[filePath].ls.push(line);
                    }else{
                        context[mapName][apiName].cF[filePath].ls.push(line);
                    }
                }
                return true;                                                                    // true: 命中规则, 终止执行后序插件           
            }
            return false;                                                                       // false: 未命中检测逻辑, 继续执行后序插件
        }catch(e){
            // console.log(e);
            const info = {
                projectName: projectName,
                matchImportItem: matchImportItem,
                apiName: apiName,
                file: filePath.split('&')[1],
                line: line,
                stack: e.stack
            };
            context.addDiagnosisInfo(info);
            return false;                                                                       // false: 插件执行报错, 继续执行后序插件
        }
    }

    // 返回分析Node节点的函数
    return {
        mapName: mapName,
        checkFun: isTypeCheck,
        afterHook: null
    };
}