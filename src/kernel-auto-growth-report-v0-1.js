(function(global){
'use strict';
const VERSION='0.1.0';
const PACKET_TYPE='42ndMind_auto_growth_report_v0_1';
function text(v){return String(v==null?'':v).trim();}
function arr(v){return Array.isArray(v)?v:[];}
function clone(v){return JSON.parse(JSON.stringify(v));}
function now(){return new Date().toISOString();}
function uniq(items){const seen=new Set(),out=[];arr(items).forEach(x=>{const v=text(x),k=v.toLowerCase();if(v&&!seen.has(k)){seen.add(k);out.push(v);}});return out;}
function doctrine(){return{report_only:true,staged_output_only:true,training_pressure_only:true,does_not_write_repo:true,belief_movement:'none'};}
function controller(){if(!global.KernelAutoGrowthControllerV01)throw new Error('KernelAutoGrowthControllerV01 unavailable');return global.KernelAutoGrowthControllerV01;}
function gateRows(packet){return arr(packet&&packet.gates).map(g=>({name:text(g.name),status:text(g.status),detail:g.detail||null,belief_movement:'none'}));}
function seedOperators(seed){return uniq(arr(seed&&seed.entries).flatMap(e=>arr(e.semantic_operators).map(op=>text(op.operator)))).sort();}
function seedPressures(seed){return uniq(arr(seed&&seed.entries).flatMap(e=>arr(e.semantic_operators).flatMap(op=>arr(op.pressure)))).sort();}
function makeMarkdown(bundle){const lines=['# Auto Growth Report','',`decision: ${bundle.decision}`,`reason: ${bundle.decision_reason}`,`current: ${bundle.current_baseline}`,`next: ${bundle.proposed_next_baseline}`,`entries: ${bundle.proposed_entry_count}`,'','gates:'];bundle.gates.forEach(g=>lines.push(`- ${g.name}: ${g.status}`));lines.push('','checks:','- staged output only','- training pressure only','- not doctrine','- belief_movement: none');return lines.join('\n');}
function make(packet){const seed=clone(packet&&packet.seed_packet_draft||{});const bundle={packet_type:PACKET_TYPE,packet_version:VERSION,created_at:now(),ok:packet&&packet.decision==='AUTO_STAGE',decision:text(packet&&packet.decision),decision_reason:text(packet&&packet.decision_reason),current_baseline:text(packet&&packet.current_baseline),proposed_next_baseline:text(packet&&packet.proposed_next_baseline),proposed_entry_count:Number(packet&&packet.proposed_entry_count||0),gates:gateRows(packet),staged_seed_packet:seed,staged_seed_json:JSON.stringify(seed,null,2),operators_in_seed:seedOperators(seed),pressures_in_seed:seedPressures(seed),markdown_report:'',doctrine:doctrine(),belief_movement:'none'};bundle.markdown_report=makeMarkdown(bundle);return bundle;}
async function run(options){const packet=await controller().runController(options||{});return make(packet);}
global.KernelAutoGrowthReportV01=Object.freeze({VERSION,PACKET_TYPE,doctrine,gateRows,seedOperators,seedPressures,makeMarkdown,make,run});
})(typeof window!=='undefined'?window:globalThis);