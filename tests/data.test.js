import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateRecipe,parseBackup,backupJSON,matches} from '../src/data.js';
const recipe=()=>({id:'a',name:'Sopa de abóbora',category:'Sopas',servings:4,minutes:30,photo:'data:image/png;base64,YWJj',ingredients:[{quantity:'500 g',name:'Abóbora'}],steps:[{text:'Cozer',time:'20 min',temperature:'100 °C',speed:'1',reverse:true}]});
test('backup roundtrip preserves photos and all TM7 parameters',()=>assert.deepEqual(parseBackup(backupJSON([recipe()])),[recipe()]));
test('search ignores accents and applies category',()=>{assert.ok(matches(recipe(),'ABOBORA','Sopas'));assert.equal(matches(recipe(),'abóbora','Doces'),false);});
test('rejects unsupported backups and duplicate IDs',()=>{assert.throws(()=>parseBackup('{"version":2}'));assert.throws(()=>parseBackup(backupJSON([recipe(),recipe()])));assert.throws(()=>parseBackup('broken'));});
test('rejects malformed recipes before import',()=>{for(const change of [{servings:0},{minutes:-1},{photo:'javascript:alert(1)'},{steps:[]},{ingredients:[]},{name:''},{steps:[{text:'Cozer',reverse:'sim'}]}])assert.throws(()=>validateRecipe({...recipe(),...change}));});
test('normalizes and strips unexpected imported properties',()=>{const valid=validateRecipe({...recipe(),name:' Sopa ',unexpected:1});assert.equal(valid.name,'Sopa');assert.equal(valid.unexpected,undefined);});
