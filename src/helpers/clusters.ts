import { Cluster } from "../types/cluster";
import { colors } from "../data/colors";
import dayjs from "dayjs";
import Color from "color";

function getCaseInMultipleClusters(clusters: Cluster[], count: number) {
  return Array(count)
    .fill(null)
    .map((_, i) => i + 1)
    .reduce((acc, m) => {
      const inClusters = clusters.filter((c) => c.people.includes(m));
      if (inClusters.length > 1) {
        acc[m] = inClusters;
      }
      return acc;
    }, {} as Record<number, Cluster[]>);
}

function getAllMultiLinkedClusters(
  casesInMultipleClusters: Record<number, Cluster[]>
) {
  const allMultiLinkedClusters = ([] as Cluster[]).concat(
    ...Object.values(casesInMultipleClusters)
  );
  return allMultiLinkedClusters.filter((c, idx, arr) => {
    return arr.findIndex((cluster) => cluster.uid === c.uid) === idx;
  });
}

function getLinksByCluster(
  multiLinkedClusters: Cluster[],
  casesInMultipleClusters: Record<number, Cluster[]>
): Record<string, Record<string, number[]>> {
  return multiLinkedClusters.reduce((acc, cluster) => {
    const entries = Object.entries(casesInMultipleClusters).map((ent) => {
      const [person, clusters] = ent;
      return [parseInt(person, 10), clusters];
    }) as Array<[number, Cluster[]]>;
    const inEntries = entries.filter((ent) => {
      const [, clusters] = ent;
      return clusters.find((c) => c.uid === cluster.uid);
    });
    if (inEntries.length > 0) {
      const allRelatedClusters = ([] as Cluster[])
        .concat(...inEntries.map((ent) => ent[1]))
        .filter((c, idx, arr) => {
          return (
            arr.findIndex((cl) => cl.uid === c.uid) === idx &&
            cluster.uid !== c.uid
          );
        });
      acc[cluster.uid] = allRelatedClusters.reduce((acc, rCluster) => {
        acc[rCluster.uid] = inEntries
          .filter((ent) => ent[1].find((c) => c.uid === rCluster.uid))
          .map((ent) => ent[0]);
        return acc;
      }, {});
    }
    return acc;
  }, {});
}

function getClusterLinkage(
  clsters: Cluster[],
  count: number
): Record<string, Record<string, number[]>> {
  const casesInMultiLinkedClusters = getCaseInMultipleClusters(clsters, count);
  const multiLinkedClusters = getAllMultiLinkedClusters(
    casesInMultiLinkedClusters
  );
  return getLinksByCluster(multiLinkedClusters, casesInMultiLinkedClusters);
}

function getClustersWeeklyUpdates(
  clusters: Cluster[],
  options: {
    today: string;
    count: number;
    showTotal?: boolean;
    stack?: boolean;
    log?: boolean;
  }
) {
  const { today, count, showTotal, stack, log } = options;
  const todayDate = dayjs(today, {
    format: "YYYY-MM-DD",
  });
  const dateKeys = Array(count || 7)
    .fill(null)
    .map((_, i) => i)
    .sort((a, b) => b - a)
    .map((offset) => todayDate.add(-offset, "day").format("YYYY-MM-DD"));

  const clustersToShow = clusters.filter((c) =>
    dateKeys.find((key) => Object.keys(c.updates || {}).includes(key))
  );

  if (stack) {
    clustersToShow.sort(
      (a, b) => (a.total ?? a.people.length) - (b.total ?? b.people.length)
    );
  }

  const clusterNotShowing = clusters.filter(
    (cl) => !clustersToShow.find((c) => c.uid === cl.uid)
  );

  const notShowingTotal = clusterNotShowing.reduce((ttl, c) => {
    ttl += c.total ?? c.people.length;
    return ttl;
  }, 0);

  const datasets = clustersToShow.map((cluster, i) => {
    return {
      yAxisID: "first-y-axis",
      label: cluster.name,
      backgroundColor: (() => {
        const [r, g, b] = Color(colors[i % colors.length])
          .rgb()
          .array();
        return `rgba(${r}, ${g}, ${b}, ${stack ? 0.9 : 0.5})`;
      })(),
      borderColor: colors[i % colors.length],
      borderWidth: 2,
      fill: true,
      datalabels: {
        labels:
          (cluster.total ?? cluster.people.length) > 50
            ? undefined
            : {
                title: null,
              },
        formatter: function (value: number, context: any) {
          const dataKey = context.chart.data.labels[context.dataIndex];
          if (dataKey !== today) {
            return value;
          }
          const label = context.chart.data.datasets[context.datasetIndex].label;
          const cluster = clusters.find((c) => c.name === label);
          const name = cluster?.short || label;
          return `${value} - ${name}`;
        },
      },
      data: dateKeys.map((date, idx, arr) => {
        if (!showTotal) {
          return cluster.updates?.[date] || 0;
        }
        if (date === today) {
          return cluster.total ?? cluster.people.length;
        }
        const datesToMinus = arr.filter((_, i) => i > idx);
        const minusNum = datesToMinus.reduce((ttl, d) => {
          ttl += cluster.updates?.[d] || 0;
          return ttl;
        }, 0);
        return Math.max((cluster.total ?? cluster.people.length) - minusNum, 0);
      }),
    };
  });
  return {
    data: {
      labels: dateKeys,
      datasets: stack
        ? [
            {
              yAxisID: "first-y-axis",
              label: "Other Clusters",
              backgroundColor: `rgba(200, 200, 200, 1)`,
              borderColor: "rgb(200, 200, 200)",
              borderWidth: 2,
              fill: true,
              data: dateKeys.map(() => notShowingTotal),
              datalabels: {
                formatter: function (value: number) {
                  return `${value} - No recent updates`;
                },
              },
            },
            ...datasets,
          ]
        : datasets,
    },
    options: {
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 10,
          right: 150,
          top: 0,
          bottom: 0,
        },
      },
      tooltips: {
        intersect: false,
      },
      plugins: {
        datalabels: {
          align: "right",
          anchor: "center",
          offset: 6,
          color: "#fff",
          backgroundColor: "rgba(50, 50, 50, .6)",
          borderRadius: 2,
          display: (context: any) => {
            const dataKey = context.chart.data.labels[context.dataIndex];
            return dataKey === today;
          },
        },
      },
      scales: {
        yAxes: [
          {
            id: "first-y-axis",
            type: log ? "logarithmic" : "linear",
            position: "left",
            stacked: stack,
            ticks: {
              min: 0,
              beginAtZero: true,
              callback: function (value: number) {
                return value;
              },
            },
          },
        ],
      },
    },
  };
}

export { getClusterLinkage, getClustersWeeklyUpdates };
