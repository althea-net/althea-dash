import React, { useEffect, useState } from "react";
import { Button, Card, CardBody, Progress } from "reactstrap";
import { useTranslation } from "react-i18next";
import { actions, connect } from "../store";
import Error from "./Error";
import ExitListItem from "./ExitListItem";
import ExitNodeSetup from "./ExitNodeSetup";

export default connect(["initializing", "exits", "exitsError", "daoAddress"])(
  ({ state }) => {
    let [t] = useTranslation();

    useEffect(() => {
      actions.getExits();
      let timer = setInterval(actions.getExits, 10000);
      return () => clearInterval(timer);
    }, []);

    let [selectingExit, setSelectingExit] = useState(true);

    let { exits, exitsError, initializing, daoAddress } = state;

    exits = exits || [];
    let selected = exits.find(exit => {
      let { state } = exit.exitSettings;
      return exit.isSelected && state === "Registered";
    });

    let available = exits.filter(exit => {
      let { state } = exit.exitSettings;
      return state !== "Disabled" && state !== "New";
    });

    return (
      <Card>
        <CardBody>
          <h2>{t("exitNode")}</h2>
          {daoAddress ? (
            <div>
              <p>{t("exitNodesP1")}</p>
              {selected ? (
                <ExitListItem exit={selected} />
              ) : (
                <div>
                  <p>{t("exitNodesP2")}</p>
                  <Button
                    color="primary"
                    style={{ width: 240 }}
                    onClick={() => setSelectingExit(true)}
                  >
                    Setup Exit Node
                  </Button>
                  {selectingExit && (
                    <ExitNodeSetup
                      open={selectingExit}
                      setOpen={setSelectingExit}
                      exits={available}
                    />
                  )}
                </div>
              )}
            </div>
          ) : (
            <p>{t("exitNodesSetup")}</p>
          )}
          <Error error={exitsError} />
          {!exits &&
            initializing && <Progress animated color="info" value="100" />}
        </CardBody>
      </Card>
    );
  }
);
