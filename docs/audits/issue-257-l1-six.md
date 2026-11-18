# Issue #257 — L1 suspicious six

Staging base: `46f9ec11b939cd306ba96b859a929994c14780b4`

| ID | Decision | Reason |
|----|----------|--------|
| l1v2-a-poe-limit | KEEP L1 | Screen reading of PSE Type/polarity; no protocol theory required |
| l1v2-c-otdr-pulse | KEEP L1 | Reading “100 ns” from OTDR field; no reflectometry knowledge needed |
| l3-d05 | MOVE L2 | PAT/NAT overload — address+port session distinction beyond pure beginner |
| l4-d03 | MOVE L2 | TCP TIME-WAIT purpose requires connection-lifecycle concepts |
| l4-d05 | MOVE L2 | TCP SACK — non-contiguous acknowledgment is advanced TCP |
| tcpip-d05 | MOVE L2 | ECN congestion marking is beyond L1 foundations |

L1 pool: 220 → 216  
L2 pool: 160 → 164

Questions, keys, and explanations unchanged.  
Old attempts continue by saved ID.
