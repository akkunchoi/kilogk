import { useState, useEffect, useContext } from "react";
import { render, Box, Color, Text, Static, useInput, AppContext } from "ink";
import React from "react";
import { KilogkRunOption, RecordType, KilogkConfig } from "./types";
import { Container } from "inversify";
import { DailyFileRepository } from "./DailyFileRepository";
import { DailyFile } from "./DailyFile";
import { DailyLog } from "./DailyLog";
import moment from "moment";
import _ from "lodash";
import { EventDetector } from "./EventDetector";
import { EventAnalyzer } from "./EventAnalyzer";
import { Controller } from "./Controller";
import { DailyLogFactory } from "./DailyLogFactory";
import { Record } from "./Record";
import { Event } from "./Event";

export const App = (props: {runOption: KilogkRunOption, container: Container}) => {
  const runOption = props.runOption;
  const container = props.container;

  const [result, setResult] = useState({} as any);
  const { exit } = useContext(AppContext);

  const ctrl = container.get<Controller>(Controller);
  const built = ctrl.build(runOption);

  useEffect(() => {
    console.log("effect");
    built.then((result) => {
      console.log("then");
      setResult(result);
    });  
    return () => {
      // console.log("cleanup");
    };

  }, [props.runOption]);

  const UserInput = () => {
    useInput((input, key) => {
      if (input === "q") {
        console.log(input);
        // Exit program
        exit();
      }
      if (key.leftArrow) {
        console.log("left");
        // Left arrow key pressed
      }
    });
    return <></>;
  };

  return <>
    {
      result.dates &&
      <Box flexDirection="column">
        <Box flexDirection="row">
          { moment(_.first(result.dates)).format() } - { moment(_.last(result.dates)).format() }
        </Box>
          {
            runOption.outputRecords &&
              <div>
                {
                  (result.targetLogs || []).map((targetLog: DailyLog, i: number) => (
                    <div key={i}>
                      {
                        targetLog.records.map((record: Record, j: number) => (
                          <Box key={j}>
                            <Box width="26">{moment(record.datetime).format()}</Box>
                            <Box>{record.text}</Box>
                          </Box>
                        ))
                      }
                    </div>
                  ))
                }
              </div>  
            }
            { 
              runOption.outputEvents &&
              <div>
                {
                  (result.events || []).map((event: Event, i: number) => (
                    <Box key={i}>
                      <Box>{ event.start ? moment(event.start.datetime).format("MM/DD HH:mm") : "-----------" }</Box>
                      <Box>{ " to " + moment(event.end.datetime).format("MM/DD HH:mm") + " " }</Box>
                      <Box>{ " ( " + Math.floor(event.elapsed / 1000 / 3600) + " ) " }</Box>
                      <Box>{ event.end.text + " " }</Box>
                    </Box>
                  ))
                }
              </div>  
            }
            { 
              result.moreThan20HoursEvents && result.moreThan20HoursEvents.length > 0 &&
              <div>
                {
                  (result.moreThan20HoursEvents || []).map((event: Event, i: number) => (
                    <Box key={i}>
                      <Box>{ event.end.text + " " }</Box>
                      <Box>{ " [ " }</Box>
                      <Box>{ " from " + (event.start ? moment(event.start.datetime).format("MM/DD HH:mm") : "--") }</Box>
                      <Box>{ " to " + moment(event.end.datetime).format("MM/DD HH:mm") + " " }</Box>
                      <Box>{ " elapsed " + Math.floor(event.elapsed / 1000 / 3600) }</Box>
                      <Box>{ " ] " }</Box>
                    </Box>
                  ))
                }
              </div>  
            }   
            { 
              result.outputIsolations && result.outputIsolations.length > 0 &&
              <div>
                {
                  (result.outputIsolations || []).map((record: Record, i: number) => (
                    <Box key={i}>
                      <Box width="26">{moment(record.datetime).format()}</Box>
                      <Box>{record.text}</Box>
                    </Box>
                  ))
                }
              </div>  
            }
            {
              
            }

      </Box>
    }
  </>;
};

export default async (runOption: KilogkRunOption, container: Container) => {  

  const result: any = {};

  const {unmount, waitUntilExit} = render(<App runOption={runOption} container={container} />);
  return waitUntilExit;

};
        // // console.log("Events: ");
        // // const eventAnalyzer = this.container.get<EventAnalyzer>(EventAnalyzer);
        // // eventAnalyzer.analyze(_result.events, {outputRecords: runOption.outputRecords, period: dates});
        // // console.log("");
