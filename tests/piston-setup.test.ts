import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import type { AddressInfo } from "node:net";

test("prepara runtimes usando language_version del contrato real de Piston", async () => {
  const installations: {language:string;version:string}[]=[];
  const server=createServer(async(req,res)=>{
    res.setHeader("Content-Type","application/json");
    if(req.method==="GET"){
      res.end(JSON.stringify([
        {language:"python",language_version:"3.9.4",installed:false},
        {language:"python",language_version:"3.12.0",installed:false},
        {language:"node",language_version:"20.11.1",installed:true},
        {language:"node",language_version:"22.0.0",installed:false},
        {language:"typescript",language_version:"5.0.3",installed:false},
      ]));
    }else{
      let body="";for await(const chunk of req)body+=chunk;
      installations.push(JSON.parse(body));res.end("{}");
    }
  });
  await new Promise<void>(resolve=>server.listen(0,"127.0.0.1",resolve));
  try{
    const port=(server.address() as AddressInfo).port;
    const child=spawn(process.execPath,["scripts/piston.mjs"],{env:{...process.env,PISTON_URL:`http://127.0.0.1:${port}`}});
    let stderr="";child.stderr.on("data",chunk=>stderr+=chunk);
    const status=await new Promise<number|null>((resolve,reject)=>{child.on("error",reject);child.on("close",resolve);});
    assert.equal(status,0,stderr);
    assert.deepEqual(installations,[{language:"python",version:"3.12.0"},{language:"typescript",version:"5.0.3"}]);
  }finally{await new Promise<void>(resolve=>server.close(()=>resolve()));}
});
