import React, { useState } from 'react';
import { ViewKey } from '../components/Sidebar';
import { ONTOLOGY_NODES, ONTOLOGY_EDGES } from '../data/seedData';
import { OntologyNode } from '../types/ontology';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import {
  Network,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Info,
  GitBranch,
  Layers,
  ArrowRight,
  Filter,
  Eye,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface OntologyVisualizerProps {
  onNavigate: (view: ViewKey) => void;
}

export const OntologyVisualizer: React.FC<OntologyVisualizerProps> = ({ onNavigate }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('Concept_Patient');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [highlightTransitivity, setHighlightTransitivity] = useState(false);

  const selectedNode = ONTOLOGY_NODES.find(n => n.id === selectedNodeId) || ONTOLOGY_NODES[1];

  // Filtering nodes
  const visibleNodes = categoryFilter === 'ALL'
    ? ONTOLOGY_NODES
    : ONTOLOGY_NODES.filter(n => n.category === categoryFilter || n.type === 'Root');

  // Filtering edges where both source and target are visible
  const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
  const visibleEdges = ONTOLOGY_EDGES.filter(
    e => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
  );

  // Incoming and Outgoing edges for selected node
  const outgoingEdges = ONTOLOGY_EDGES.filter(e => e.source === selectedNode.id);
  const incomingEdges = ONTOLOGY_EDGES.filter(e => e.target === selectedNode.id);

  const handleZoom = (delta: number) => {
    setZoomLevel(prev => Math.min(1.8, Math.max(0.6, prev + delta)));
  };

  const isAncestorHighlighted = (nodeId: string) => {
    if (!highlightTransitivity) return false;
    return (selectedNode.transitiveAncestors || []).includes(nodeId) ||
           (selectedNode.transitiveAncestors || []).some(anc => {
             const target = ONTOLOGY_NODES.find(n => n.label === anc);
             return target?.id === nodeId;
           });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <DisclaimerBanner compact />

      {/* Top Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-1">
            <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200">
              Interactive Graph • Connected Node Hierarchy
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Network className="w-5 h-5 text-indigo-600" />
            Clinical Ontology Visualizer
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any concept node to inspect its attributes, taxonomy, defining features, and transitive inheritance.
          </p>
        </div>

        {/* Graph Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg px-2.5 py-1 text-xs border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Concepts</option>
              <option value="Patient">Patient Core</option>
              <option value="Symptom">Symptoms</option>
              <option value="VitalSign">Vital Signs</option>
              <option value="Priority">Priority Strata</option>
            </select>
          </div>

          {/* Transitivity Highlight Toggle */}
          <button
            onClick={() => setHighlightTransitivity(prev => !prev)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              highlightTransitivity
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Transitivity Path</span>
          </button>

          {/* Zoom Buttons */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              onClick={() => handleZoom(0.15)}
              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleZoom(-0.15)}
              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* GRAPH CANVAS & INSPECTOR SPLIT VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Interactive SVG Node-Link Canvas */}
        <div className="lg:col-span-8 bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative">
          
          {/* Canvas Watermark / Guide */}
          <div className="absolute top-3 left-4 z-10 text-[10px] text-slate-400 font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Interactive SVG Network • Zoom: {(zoomLevel * 100).toFixed(0)}%</span>
          </div>

          <div className="w-full h-[600px] overflow-auto flex items-center justify-center p-6 cursor-grab active:cursor-grabbing">
            <svg
              viewBox="0 0 900 700"
              className="w-full h-full transition-transform duration-200 ease-out select-none"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
            >
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
                </marker>
                <marker
                  id="arrow-active"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
                </marker>
              </defs>

              {/* Render Semantic Edges */}
              {visibleEdges.map(edge => {
                const srcNode = ONTOLOGY_NODES.find(n => n.id === edge.source);
                const tgtNode = ONTOLOGY_NODES.find(n => n.id === edge.target);
                if (!srcNode || !tgtNode) return null;

                const isConnectedToSelected = edge.source === selectedNode.id || edge.target === selectedNode.id;
                const strokeColor = isConnectedToSelected ? '#38bdf8' : '#334155';
                const strokeWidth = isConnectedToSelected ? 2.5 : 1.2;

                const midX = (srcNode.x! + tgtNode.x!) / 2;
                const midY = (srcNode.y! + tgtNode.y!) / 2;

                return (
                  <g key={edge.id}>
                    <line
                      x1={srcNode.x}
                      y1={srcNode.y}
                      x2={tgtNode.x}
                      y2={tgtNode.y}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeDasharray={edge.isTransitive ? '4 2' : undefined}
                      markerEnd={isConnectedToSelected ? 'url(#arrow-active)' : 'url(#arrow)'}
                    />
                    <text
                      x={midX}
                      y={midY - 4}
                      fill={isConnectedToSelected ? '#7dd3fc' : '#64748b'}
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                      className="select-none bg-slate-900"
                    >
                      {edge.label}
                    </text>
                  </g>
                );
              })}

              {/* Render Ontology Nodes */}
              {visibleNodes.map(node => {
                const isSelected = node.id === selectedNode.id;
                const isAncestor = isAncestorHighlighted(node.id);
                const isRoot = node.type === 'Root';
                const isInstance = node.type === 'Instance';

                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className="cursor-pointer group"
                    transform={`translate(${node.x}, ${node.y})`}
                  >
                    {/* Pulsing ring on selected */}
                    {isSelected && (
                      <circle
                        r={isRoot ? 38 : isInstance ? 30 : 34}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2.5"
                        strokeDasharray="4 2"
                        className="animate-spin-slow"
                      />
                    )}

                    {/* Transitivity highlight halo */}
                    {isAncestor && !isSelected && (
                      <circle
                        r={34}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="3"
                      />
                    )}

                    {/* Node Core Body */}
                    <circle
                      r={isRoot ? 32 : isInstance ? 24 : 28}
                      fill={node.color || '#0284c7'}
                      stroke={isSelected ? '#ffffff' : '#1e293b'}
                      strokeWidth={isSelected ? 3 : 1.5}
                      className="group-hover:scale-110 transition-transform filter drop-shadow-md"
                    />

                    {/* Node Label */}
                    <text
                      y={isRoot ? 46 : isInstance ? 36 : 40}
                      fill={isSelected ? '#ffffff' : '#cbd5e1'}
                      fontSize={isRoot ? '11' : '10'}
                      fontWeight="bold"
                      textAnchor="middle"
                      className="pointer-events-none tracking-tight"
                    >
                      {node.label}
                    </text>

                    {/* Node Type Pill */}
                    <text
                      y={isRoot ? 57 : isInstance ? 47 : 51}
                      fill="#94a3b8"
                      fontSize="8"
                      fontFamily="monospace"
                      textAnchor="middle"
                      className="pointer-events-none"
                    >
                      {node.type}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Graph Legend */}
          <div className="bg-slate-900 border-t border-slate-800 p-3 px-4 flex flex-wrap items-center justify-between gap-3 text-[10px] text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]"></span> Concept
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]"></span> SubConcept
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626]"></span> Instance
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-slate-400"></span> Solid: Direct Relation
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t border-dashed border-slate-400"></span> Dashed: Transitive is_a
              </span>
            </div>
            <span className="text-slate-500 font-mono">Click node to inspect</span>
          </div>
        </div>

        {/* NODE INSPECTOR PANEL */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span 
                className="w-3.5 h-3.5 rounded-full"
                style={{ backgroundColor: selectedNode.color || '#0284c7' }}
              ></span>
              <h3 className="font-bold text-sm text-slate-900">Ontology Node Inspector</h3>
            </div>
            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
              {selectedNode.type}
            </span>
          </div>

          {/* Node Identity */}
          <div className="space-y-1">
            <div className="text-base font-extrabold text-slate-900">
              {selectedNode.label}
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              URI: http://kets.org/ontology#{selectedNode.id}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pt-1">
              {selectedNode.description}
            </p>
          </div>

          {/* Defining Features (Necessary & Sufficient) */}
          {selectedNode.definingFeatures && selectedNode.definingFeatures.length > 0 && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                Defining Features (Unit 3):
              </span>
              <ul className="list-disc pl-4 text-xs text-slate-700 space-y-0.5">
                {selectedNode.definingFeatures.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Object Features / Semantic Roles */}
          {selectedNode.objectFeatures && (
            <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 space-y-1.5">
              <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                Object Features (Roles):
              </span>
              <div className="space-y-1 text-xs">
                {Object.entries(selectedNode.objectFeatures).map(([role, target], i) => (
                  <div key={i} className="flex items-center justify-between font-mono">
                    <span className="text-indigo-950 font-semibold">{role}</span>
                    <span className="text-indigo-600 font-bold">&rarr; {target}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transitive Ancestors & Taxonomic Inheritance */}
          {selectedNode.transitiveAncestors && (
            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 space-y-1.5">
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                <GitBranch className="w-3.5 h-3.5 text-amber-700" />
                Transitivity & Subsumption:
              </span>
              <p className="text-xs text-amber-950 font-mono">
                {selectedNode.label} &sube; {selectedNode.transitiveAncestors.join(' &sube; ')}
              </p>
              <p className="text-[10px] text-amber-800 leading-normal">
                By transitivity of <code className="font-mono">is_a</code>, this concept automatically inherits all axioms and constraints from its super-concepts.
              </p>
            </div>
          )}

          {/* Outgoing & Incoming Edges */}
          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Connected Axioms:
            </span>

            <div className="space-y-1">
              {outgoingEdges.map(edge => (
                <div key={edge.id} className="p-2 bg-slate-50 rounded-lg flex items-center justify-between text-[11px]">
                  <span className="font-mono text-slate-700">-- {edge.label} --&gt;</span>
                  <button
                    onClick={() => setSelectedNodeId(edge.target)}
                    className="font-bold text-sky-600 hover:underline truncate max-w-[140px]"
                  >
                    {edge.target}
                  </button>
                </div>
              ))}

              {incomingEdges.map(edge => (
                <div key={edge.id} className="p-2 bg-slate-50 rounded-lg flex items-center justify-between text-[11px]">
                  <span className="font-mono text-slate-700">&lt;-- {edge.label} --</span>
                  <button
                    onClick={() => setSelectedNodeId(edge.source)}
                    className="font-bold text-indigo-600 hover:underline truncate max-w-[140px]"
                  >
                    {edge.source}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
