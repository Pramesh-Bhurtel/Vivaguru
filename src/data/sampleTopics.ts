export interface SampleTopic {
  id: string;
  title: string;
  category: string;
  notes: string;
}

export const SAMPLE_TOPICS: SampleTopic[] = [
  {
    id: 'raft-consensus',
    title: 'Raft Consensus & Replicated State Machines',
    category: 'Distributed Systems',
    notes: `Raft is a consensus algorithm designed for manageability in replicated state machines. It decomposes consensus into three independent subproblems: Leader Election, Log Replication, and Safety.

1. Leader Election:
Nodes operate in one of three states: Follower, Candidate, or Leader. When followers fail to receive heartbeats within an election timeout (randomized between 150ms-300ms to prevent split votes), they transition to Candidate, increment their currentTerm, vote for themselves, and send RequestVote RPCs. A leader is elected when it receives votes from a majority of nodes.

2. Log Replication:
The leader accepts client commands, appends them to its log as entries with a monotonic index and term, and broadcasts AppendEntries RPCs to all followers. Once an entry is replicated across a majority of nodes, the leader commits it and applies it to its state machine.

3. Safety Invariants:
- Election Safety: At most one leader can be elected in a given term.
- Leader Append-Only: A leader never overwrites or truncates its own entries; it only appends new ones.
- Log Matching Property: If two logs contain an entry with the same index and term, they are identical in all entries up through that index.
- Leader Completeness: If a log entry is committed in a given term, that entry will be present in the logs of the leaders for all higher-numbered terms.
- State Machine Safety: If a server has applied a log entry at a given index to its state machine, no other server will ever apply a different log entry for that index.`,
  },
  {
    id: 'virtual-memory',
    title: 'Virtual Memory & Page Fault Architecture',
    category: 'Operating Systems',
    notes: `Virtual memory provides an abstraction of uniform, contiguous address space for processes while decoupling physical DRAM limitations and enforcing memory protection.

Key Mechanisms:
1. Paging & Address Translation:
Virtual addresses are split into Virtual Page Number (VPN) and Page Offset. The Memory Management Unit (MMU) uses the VPN to index into the page table (or multi-level hierarchical page tables) to obtain the Physical Frame Number (PFN), concatenated with the offset.

2. Translation Lookaside Buffer (TLB):
Hardware cache for recent virtual-to-physical translations. A TLB hit avoids memory-bus traversals; a TLB miss forces a page table walk.

3. Page Fault Handling:
When a valid virtual page has its 'present' bit set to 0 in its Page Table Entry (PTE), the MMU raises an architectural page fault exception (interrupt 14 on x86). The OS kernel trap handler saves CPU register state, checks if the faulting address is within the process's Virtual Memory Area (VMA). If invalid, it signals SIGSEGV. If valid, it allocates a physical frame, reads the page data from backing swap or executable binary on disk, updates the PTE present bit and PFN, invalidates the TLB entry, and resumes process execution at the faulting instruction.

4. Page Replacement Algorithms:
LRU (Least Recently Used), Clock algorithm (Second-chance using reference bits), and working set models manage DRAM eviction under memory pressure.`,
  },
  {
    id: 'backprop-transformers',
    title: 'Transformer Self-Attention & Gradient Dynamics',
    category: 'Deep Learning',
    notes: `Scaled Dot-Product Attention maps queries (Q), keys (K), and values (V) into an output representation:
Attention(Q, K, V) = softmax( (Q * K^T) / sqrt(d_k) ) * V

Key Concepts:
1. The Scaling Factor sqrt(d_k):
Without division by the square root of key dimension d_k, for large values of d_k, the dot products grow large in magnitude, pushing the softmax function into regions where gradients are infinitesimally small (vanishing gradient problem during backpropagation).

2. Multi-Head Attention:
Instead of performing a single attention function with d_model dimensional queries, keys, and values, Multi-Head Attention projects Q, K, and V with h different learned linear projections into d_k, d_k, and d_v dimensions, allowing the model to jointly attend to information from different representation subspaces at different positions.

3. Residual Connections & Layer Normalization:
Each sub-layer (Self-Attention and Feed-Forward) has a residual connection followed by LayerNorm: LayerNorm(x + Sublayer(x)). This preserves gradient highway integrity across deep transformer layers, combating vanishing/exploding gradients.

4. Computational Complexity:
Self-attention incurs O(N^2) computational complexity and O(N^2) memory footprint with respect to sequence length N, which presents a scalability bottleneck for long-context sequences.`,
  },
];
