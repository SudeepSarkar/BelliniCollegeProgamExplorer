import { useEffect, useMemo, useState, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  applyNodeChanges,
} from "reactflow";
import { InputNode, BridgeNode, DegreeNode, CareerNode } from "./Nodes.jsx";
import MobilePathwaysList from "./MobilePathwaysList.jsx";

const nodeTypes = {
  inputNode: InputNode,
  bridgeNode: BridgeNode,
  degreeNode: DegreeNode,
  careerNode: CareerNode,
};

const baseEdgeStyle = {
  stroke: "#94a3b8",
  strokeWidth: 2,
};

function useWindowSize() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return size;
}

function buildAdjacency(edges) {
  const forward = new Map();
  const reverse = new Map();
  edges.forEach((edge) => {
    if (!forward.has(edge.source)) forward.set(edge.source, []);
    if (!reverse.has(edge.target)) reverse.set(edge.target, []);
    forward.get(edge.source).push(edge.target);
    reverse.get(edge.target).push(edge.source);
  });
  return { forward, reverse };
}

function bfs(startIds, adjacency) {
  const visited = new Set();
  const queue = [...startIds];
  queue.forEach((id) => visited.add(id));
  while (queue.length) {
    const current = queue.shift();
    const neighbors = adjacency.get(current) || [];
    neighbors.forEach((next) => {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    });
  }
  return visited;
}

function getCategory(node) {
  if (node.type === "careerNode") return "career";
  const kind = node.data?.kind || "";
  if (kind.includes("minor")) return "minor";
  if (kind.includes("microcredential")) return "microcredential";
  if (kind.includes("grad certificate")) return "grad certificate";
  if (kind.includes("undergraduate")) return "undergraduate";
  if (kind.includes("graduate")) return "graduate";
  if (kind.includes("interdisciplinary")) return "interdisciplinary";
  if (kind.includes("pathway")) return "graduate";
  return "other";
}

function computeActiveIds(nodes, edges, triage, filters = []) {
  if (!triage.startingPoint && !triage.foundation && !triage.preference && !triage.careerGoal) {
    return { activeNodes: new Set(), activeEdges: new Set() };
  }

  const { forward, reverse } = buildAdjacency(edges);

  const startIds = nodes
    .filter((node) => node.data.startingPoint?.includes(triage.startingPoint))
    .map((node) => node.id);

  const reachable = startIds.length ? bfs(startIds, forward) : new Set(nodes.map((n) => n.id));

  const focusIds = new Set();
  if (triage.foundation) {
    nodes.forEach((node) => {
      if (reachable.has(node.id) && node.data.foundations?.includes(triage.foundation)) {
        focusIds.add(node.id);
      }
    });
  }
  if (triage.preference) {
    nodes.forEach((node) => {
      if (reachable.has(node.id) && node.data.preferences?.includes(triage.preference)) {
        focusIds.add(node.id);
      }
    });
  }
  if (triage.careerGoal) {
    nodes.forEach((node) => {
      if (reachable.has(node.id) && node.data.goals?.includes(triage.careerGoal)) {
        focusIds.add(node.id);
      }
    });
  }

  const targetIds = focusIds.size ? focusIds : reachable;
  const ancestors = bfs(Array.from(targetIds), reverse);

  const activeNodes = new Set();
  ancestors.forEach((id) => {
    if (reachable.has(id)) activeNodes.add(id);
  });

  if (filters.length) {
    nodes.forEach((node) => {
      if (!filters.includes(getCategory(node))) {
        activeNodes.delete(node.id);
      }
    });
  }

  const activeEdges = new Set();
  edges.forEach((edge) => {
    if (activeNodes.has(edge.source) && activeNodes.has(edge.target)) {
      activeEdges.add(edge.id);
    }
  });

  return { activeNodes, activeEdges };
}

function layoutForMobile(nodes) {
  const columns = Array.from(
    new Set(nodes.map((node) => node.position.x))
  ).sort((a, b) => a - b);
  const columnMap = new Map(columns.map((x, index) => [x, index]));

  const grouped = new Map();
  nodes.forEach((node) => {
    const col = columnMap.get(node.position.x) ?? 0;
    if (!grouped.has(col)) grouped.set(col, []);
    grouped.get(col).push(node);
  });

  grouped.forEach((group) => group.sort((a, b) => a.position.y - b.position.y));

  const updated = nodes.map((node) => {
    const col = columnMap.get(node.position.x) ?? 0;
    const group = grouped.get(col) || [];
    const row = group.findIndex((item) => item.id === node.id);
    return {
      ...node,
      position: {
        x: 40,
        y: col * 280 + row * 160,
      },
    };
  });

  return updated;
}

function staggerNodes(nodes) {
  const grouped = new Map();
  nodes.forEach((node) => {
    const key = node.position.x;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(node);
  });

  grouped.forEach((group) => group.sort((a, b) => a.position.y - b.position.y));

  return nodes.map((node) => {
    const group = grouped.get(node.position.x) || [];
    const index = group.findIndex((item) => item.id === node.id);
    const offset = index % 2 === 0 ? -12 : 12;
    return {
      ...node,
      position: {
        x: node.position.x + offset,
        y: node.position.y,
      },
    };
  });
}

export default function PathwaysGraph({ data, triage, active, onNodeSelect, focusMode, filters }) {
  const { width } = useWindowSize();
  const isMobile = width < 900;

  const { activeNodes, activeEdges } = useMemo(
    () =>
      active
        ? computeActiveIds(data.nodes, data.edges, triage, filters)
        : { activeNodes: new Set(), activeEdges: new Set() },
    [active, data, triage, filters]
  );

  const baseNodes = useMemo(
    () => (isMobile ? layoutForMobile(data.nodes) : staggerNodes(data.nodes)),
    [isMobile, data.nodes]
  );

  const [nodes, setNodes] = useNodesState(baseNodes);

  useEffect(() => {
    setNodes(baseNodes);
  }, [baseNodes, setNodes]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const styledNodes = useMemo(() => {
    return nodes.map((node) => {
      const isActive = activeNodes.size ? activeNodes.has(node.id) : false;
      const filteredOut = filters.length ? !filters.includes(getCategory(node)) : false;
      const hidden = focusMode && activeNodes.size ? !isActive : false;
      return {
        ...node,
        hidden: hidden || false,
        style: {
          opacity: activeNodes.size
            ? isActive
              ? 1
              : 0.2
            : filteredOut
              ? 0.2
              : 0.35,
          transition: "opacity 300ms ease",
        },
      };
    });
  }, [activeNodes, nodes, focusMode, filters]);

  const nodeLookup = useMemo(() => {
    const map = new Map();
    nodes.forEach((node) => map.set(node.id, node));
    return map;
  }, [nodes]);

  const columnPositions = useMemo(() => {
    const positions = Array.from(new Set(nodes.map((node) => Math.round(node.position.x / 10) * 10)));
    return positions.sort((a, b) => a - b);
  }, [nodes]);

  const getColumnIndex = useCallback(
    (x) => {
      if (!columnPositions.length) return 0;
      let closestIndex = 0;
      let closestDist = Math.abs(columnPositions[0] - x);
      columnPositions.forEach((pos, idx) => {
        const dist = Math.abs(pos - x);
        if (dist < closestDist) {
          closestDist = dist;
          closestIndex = idx;
        }
      });
      return closestIndex;
    },
    [columnPositions]
  );

  const [hoveredNodeId, setHoveredNodeId] = useState(null);

  const hoverContext = useMemo(() => {
    if (!hoveredNodeId) return { hoverNodes: new Set(), hoverEdges: new Set() };
    const { forward, reverse } = buildAdjacency(data.edges);
    const inputIds = data.nodes.filter((node) => node.type === "inputNode").map((node) => node.id);
    const outcomeIds = data.nodes.filter((node) => node.type === "careerNode").map((node) => node.id);
    const nodesFromInputs = bfs(inputIds, forward);
    const nodesToOutcomes = bfs(outcomeIds, reverse);
    const ancestors = bfs([hoveredNodeId], reverse);
    const descendants = bfs([hoveredNodeId], forward);
    const hoverNodes = new Set();
    ancestors.forEach((id) => {
      if (nodesFromInputs.has(id)) hoverNodes.add(id);
    });
    descendants.forEach((id) => {
      if (nodesToOutcomes.has(id)) hoverNodes.add(id);
    });
    hoverNodes.add(hoveredNodeId);
    const hoverEdges = new Set();
    data.edges.forEach((edge) => {
      if (hoverNodes.has(edge.source) && hoverNodes.has(edge.target)) {
        hoverEdges.add(edge.id);
      }
    });
    return { hoverNodes, hoverEdges };
  }, [hoveredNodeId, data.edges]);

  const edges = useMemo(() => {
    return data.edges.map((edge) => {
      const isActive = activeEdges.has(edge.id);
      const isHover = hoverContext.hoverEdges.has(edge.id);
      const targetNode = nodeLookup.get(edge.target);
      const sourceNode = nodeLookup.get(edge.source);
      const optional =
        targetNode?.data?.kind?.includes("minor") ||
        targetNode?.data?.kind?.includes("microcredential") ||
        targetNode?.data?.kind?.includes("grad certificate");
      const colDelta =
        sourceNode && targetNode
          ? Math.abs(getColumnIndex(sourceNode.position.x) - getColumnIndex(targetNode.position.x))
          : 0;
      const edgeType = colDelta > 1 ? "bezier" : "straight";
      const hidden =
        focusMode && activeNodes.size
          ? !(activeNodes.has(edge.source) && activeNodes.has(edge.target))
          : false;
      return {
        ...edge,
        animated: isActive || isHover,
        type: edgeType,
        hidden,
        style: {
          ...baseEdgeStyle,
          stroke: isHover ? "#CFC096" : isActive ? "#CFC096" : baseEdgeStyle.stroke,
          strokeWidth: optional ? 1.4 : isHover ? 3 : isActive ? 2.6 : 2,
          strokeDasharray: optional ? "6 6" : "none",
          opacity: activeNodes.size ? (isActive || isHover ? 1 : 0.12) : 0.2,
        },
      };
    });
  }, [activeEdges, activeNodes.size, data.edges, hoverContext.hoverEdges, nodeLookup, focusMode, activeNodes]);

  if (isMobile) {
    return <MobilePathwaysList data={data} triage={triage} active={active} />;
  }

  const handleSaveLayout = useCallback(() => {
    const payload = {
      nodes: nodes.map((node) => ({
        ...node,
        position: { x: node.position.x, y: node.position.y },
      })),
      edges: data.edges,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "data.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, [data.edges, nodes]);

  return (
    <div className="relative h-[70vh] md:h-[72vh] w-full rounded-3xl bg-white shadow-card overflow-visible">
      <div className="pointer-events-none absolute inset-0 grid grid-cols-5">
        <div className="bg-gradient-to-b from-[#f8fbfa] via-transparent to-transparent"></div>
        <div className="bg-gradient-to-b from-[#f5f8f6] via-transparent to-transparent"></div>
        <div className="bg-gradient-to-b from-[#f8f6f1] via-transparent to-transparent"></div>
        <div className="bg-gradient-to-b from-[#f5f8f6] via-transparent to-transparent"></div>
        <div className="bg-gradient-to-b from-[#f8fbfa] via-transparent to-transparent"></div>
      </div>
      <div className="pointer-events-none absolute inset-x-6 top-4 grid grid-cols-5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        <div>
          Inputs
          <div className="text-[10px] font-normal tracking-normal text-slate-400">Starting point</div>
        </div>
        <div>
          Undergrad
          <div className="text-[10px] font-normal tracking-normal text-slate-400">Core majors</div>
        </div>
        <div>
          Interdisciplinary & Minors
          <div className="text-[10px] font-normal tracking-normal text-slate-400">Paired paths</div>
        </div>
        <div>
          Graduate & Credentials
          <div className="text-[10px] font-normal tracking-normal text-slate-400">Advanced study</div>
        </div>
        <div>
          Outcomes
          <div className="text-[10px] font-normal tracking-normal text-slate-400">Career goals</div>
        </div>
      </div>
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          className={`px-3 py-2 rounded-full text-xs font-semibold border ${
            isMobile
              ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
              : "bg-usf-green text-white border-usf-green hover:bg-[#00543b]"
          }`}
          onClick={handleSaveLayout}
          disabled={isMobile}
          title={isMobile ? "Save layout is available on desktop width." : "Download data.json with updated positions"}
        >
          Save Layout
        </button>
      </div>
      <ReactFlow
        nodes={styledNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.4 }}
        minZoom={0.4}
        maxZoom={1.5}
        onNodeClick={(_, node) => onNodeSelect?.(node)}
        onNodesChange={onNodesChange}
        onNodeMouseEnter={(_, node) => setHoveredNodeId(node.id)}
        onNodeMouseLeave={() => setHoveredNodeId(null)}
        style={{ background: "white", borderRadius: 24, overflow: "visible" }}
      >
        <Background gap={26} color="#e2e8f0" />
        <Controls />
      </ReactFlow>
    </div>
  );
}
