import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Badge, Button, Progress, Table } from "reactstrap";
import { get, useStore } from "store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import EnforcementModal from "./EnforcementModal";

const AbortController = window.AbortController;

const RelaySettings = () => {
  const [t] = useTranslation();
  const [neighbors, setNeighbors] = useState();
  const [loading, setLoading] = useState();
  const [open, setOpen] = useState(false);
  const [{ exits }] = useStore();

  useEffect(
    () => {
      const controller = new AbortController();
      const signal = controller.signal;

      (async () => {
        setLoading(true);
        try {
          let debts = await get("/debts", true, 10000, signal);
          let neighbors = await get("/neighbors", true, 10000, signal);
          if (debts instanceof Error || neighbors instanceof Error) return;

          neighbors = neighbors
            .filter(n => {
              return !exits.find(
                e =>
                  e.exitSettings &&
                  e.exitSettings.id.meshIp === n.ip.replace(/"/g, "")
              );
            })
            .map(n => {
              n.enforcing =
                debts.find(
                  d =>
                    d.identity.meshIp === n.ip &&
                    d.paymentDetails.action === "SuspendTunnel"
                ) !== undefined;
              return n;
            });

          setNeighbors(neighbors);
        } catch (e) {}
        setLoading(false);
      })();

      return () => controller.abort();
    },
    [exits]
  );

  if (loading) return <Progress animated color="info" value="100" />;

  const toggle = () => setOpen(!open);

  return (
    <>
      <h1 id="frontPage">{t("neighbors")}</h1>
      {!neighbors || !neighbors.length ? (
        <Alert color="info">{t("noNeighbors")}</Alert>
      ) : (
        <div className="table-responsive">
          <Table className="table-striped">
            <thead>
              <tr>
                <th style={{ whiteSpace: "nowrap" }}>{t("nickname")}</th>
                <th style={{ whiteSpace: "nowrap" }}>
                  {t("connectionQuality")}
                </th>
                <th
                  style={{ cursor: "pointer", whiteSpace: "nowrap" }}
                  onClick={toggle}
                >
                  {t("enforcing")}{" "}
                  <FontAwesomeIcon
                    id="tooltip"
                    icon="question-circle"
                    className="mr-2"
                  />
                  <EnforcementModal open={open} toggle={toggle} />
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {neighbors.map((n, i) => (
                <tr key={i}>
                  <td style={{ verticalAlign: "middle" }}>{n.nickname}</td>
                  <td style={{ verticalAlign: "middle" }}>
                    {n.routeMetricToExit}
                  </td>
                  {n.enforcing ? (
                    <>
                      <td style={{ verticalAlign: "middle" }}>
                        <Badge color="danger" className="mb-1">
                          {t("yes")}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          outline
                          style={{ whiteSpace: "nowrap" }}
                        >
                          {t("stopEnforcing")}
                        </Button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>
                        <Badge color="success">{t("no")}</Badge>
                      </td>
                      <td />
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </>
  );
};

export default RelaySettings;
