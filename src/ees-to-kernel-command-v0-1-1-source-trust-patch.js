/* 42ndMind EES → Kernel Command v0.1.1 source-trust patch
 *
 * Purpose:
 * Preserve v0.1 compiler behavior while attaching source-trust bridge pressure
 * to generated epistemic_kernel_command packets.
 *
 * This patch does not import commands, decide truth, or move belief. It only
 * adds source-trust metadata/pressure when KernelSourceTrustBridgeV04 is present.
 */
(function (global) {
  'use strict';
  if (!global.EESToKernelCommandV01) return;

  const BASE = global.EESToKernelCommandV01;
  const VERSION = '0.1.1-source-trust-patch';

  function text(value) { return String(value ?? '').trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function unique(items) {
    const seen = new Set();
    const out = [];
    asArray(items).forEach(item => {
      const t = text(item);
      const k = t.toLowerCase();
      if (t && !seen.has(k)) { seen.add(k); out.push(t); }
    });
    return out;
  }
  function byId(items) {
    return Object.fromEntries(asArray(items).map(item => [text(item.id || item.source_id), item]).filter(row => row[0]));
  }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }

  function selectedMechanism(registry, options) {
    const mechanisms = asArray(registry && registry.mechanisms);
    if (text(options && options.mechanism_id)) return mechanisms.find(m => text(m.id) === text(options.mechanism_id));
    return mechanisms[Number.isInteger(options && options.mechanism_index) ? options.mechanism_index : 0];
  }

  function sourceIdsFor(registry, mechanism) {
    const ids = [];
    asArray(mechanism && mechanism.source_ids).forEach(id => ids.push(id));
    asArray(registry && registry.events).forEach(event => {
      if (asArray(mechanism && mechanism.event_ids).map(text).includes(text(event.id))) {
        asArray(event.source_ids).forEach(id => ids.push(id));
      }
    });
    asArray(registry && registry.links).forEach(link => {
      const from = text(link.from_id);
      const to = text(link.to_id);
      if (from === text(mechanism && mechanism.id) || to === text(mechanism && mechanism.id) || asArray(mechanism && mechanism.event_ids).map(text).includes(from) || asArray(mechanism && mechanism.event_ids).map(text).includes(to)) {
        asArray(link.source_ids).forEach(id => ids.push(id));
      }
    });
    return unique(ids);
  }

  function sourceObjectsFor(registry, mechanism) {
    const ids = sourceIdsFor(registry, mechanism);
    const map = byId(asArray(registry && registry.sources).concat(asArray(registry && registry.source_registry)));
    return ids.map(id => {
      const existing = map[text(id)];
      if (existing) return existing;
      return {
        id:text(id),
        source_id:text(id),
        label:text(id),
        type:'unknown source referenced by EES registry',
        evidence:[],
        history:{}
      };
    });
  }

  function enrichSampleRegistry(registry) {
    const next = clone(registry || {});
    if (!Array.isArray(next.sources)) {
      next.sources = [
        { id:'source_export_2024', label:'Export exposure source', type:'official record raw dataset', evidence:[{ type:'raw dataset', text:'2024 export exposure data' }], history:{ primary_evidence_count:1 } },
        { id:'source_tariff_framework', label:'Tariff framework source', type:'official record primary document', evidence:[{ type:'primary document', text:'Tariff framework document' }], history:{ primary_evidence_count:1 } },
        { id:'source_ev_surtax', label:'EV surtax source', type:'official record primary document', evidence:[{ type:'primary document', text:'EV surtax public record' }], history:{ primary_evidence_count:1 } }
      ];
    }
    return next;
  }

  function attachSourceTrust(report, registry, mechanism) {
    if (!global.KernelSourceTrustBridgeV04 || typeof global.KernelSourceTrustBridgeV04.attachToCommand !== 'function') {
      report.source_trust_patch = { applied:false, reason:'KernelSourceTrustBridgeV04_unavailable' };
      report.packet_version = VERSION;
      return report;
    }
    const sources = sourceObjectsFor(registry, mechanism);
    const attached = global.KernelSourceTrustBridgeV04.attachToCommand(report.epistemic_kernel_command, sources);
    report.epistemic_kernel_command = attached.command;
    report.source_trust_bridge = attached.source_trust_bridge;
    report.source_trust_patch = {
      applied:true,
      source_count:sources.length,
      bridge_decision:attached.source_trust_bridge.decision,
      belief_movement:'none',
      import_executed:false
    };
    report.counts.source_trust_pressure_evidence = asArray(attached.source_trust_bridge.pressure_evidence).length;
    report.doctrine.source_trust_bridge_attached = true;
    report.doctrine.source_trust_prior_is_metadata_pressure = true;
    report.doctrine.certification_cannot_replace_evidence = true;
    report.doctrine.belief_movement = 'none';
    report.packet_version = VERSION;
    return report;
  }

  function compileMechanism(registryInput, options) {
    const registry = BASE.extractRegistry(registryInput);
    const report = BASE.compileMechanism(registryInput, options || {});
    const mechanism = selectedMechanism(registry, options || {});
    if (!registry || !mechanism) return report;
    return attachSourceTrust(report, registry, mechanism);
  }

  function sampleRegistry() {
    return enrichSampleRegistry(BASE.sampleRegistry());
  }

  global.EESToKernelCommandV01 = Object.freeze(Object.assign({}, BASE, {
    VERSION,
    compileMechanism,
    sampleRegistry,
    sourceObjectsFor,
    sourceIdsFor
  }));
})(typeof window !== 'undefined' ? window : globalThis);
