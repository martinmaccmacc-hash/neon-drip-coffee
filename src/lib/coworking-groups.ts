// Agrupa pods idénticos por nombre: "Cyber-Pod Alpha-1" → "Cyber-Pod Alpha".
// Es solo visual: cada pod sigue siendo una fila propia con sus reservas.

export function podGroupName(name: string): string {
  return name.replace(/-\d+$/, "").trim();
}

export function podUnitLabel(name: string): string {
  return name.split(" ").pop() ?? name;
}

export function groupPods<T extends { name: string }>(
  pods: T[]
): { name: string; pods: T[] }[] {
  const groups = new Map<string, T[]>();
  for (const pod of pods) {
    const key = podGroupName(pod.name);
    groups.set(key, [...(groups.get(key) ?? []), pod]);
  }
  return Array.from(groups, ([name, pods]) => ({ name, pods }));
}
