import { useState, useEffect, useContext } from "react";
import { render, Box, Text, Static, useInput, useApp, Newline, Spacer } from "ink";
import React from "react";
import { KilogkRunOption, RecordType, KilogkConfig, EventPatternType } from "./types";
import { Container } from "inversify";
import { DailyLog } from "./DailyLog";
import moment from "moment";
import _ from "lodash";
import { Controller } from "./Controller";
import { Record } from "./Record";
import { Event } from "./Event";
import MultiSelect from 'ink-multi-select';
import { EventPattern } from "./EventPattern";

const UserInput = () => {
  const { exit } = useApp();

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

const Demo = () => {
  const handleSelect = (item: any) => {
    console.log('handle', item)
  };

  const items = [
    {
      label: 'First',
      value: 'first'
    },
    {
      label: 'Second',
      value: 'second'
    },
    {
      label: 'Third',
      value: 'third'
    }
  ];

  return <MultiSelect items={items} onSubmit={handleSelect} />;
};

// const formatHour = (x: number) => Math.round(x * 10) / 10;
const formatHour = (x: number) => (new Intl.NumberFormat('ja-JP', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
}).format(x))

export const App = (props: { runOption: KilogkRunOption, container: Container }) => {
  const runOption = props.runOption;
  const container = props.container;

  const [result, setResult] = useState({} as any);

  const ctrl = container.get<Controller>(Controller);
  const built = ctrl.build(runOption);

  useEffect(() => {
    built.then((result) => {
      setResult(result);
    });
    return () => {
    };

  }, [props.runOption]);

  const ymdFormat = "YYYY/MM/DD"
  const dateFormat = "MM/DD"
  const timeFormat = "HH:mm"
  const dayFormat = "ddd"
  const notimeText = '-----'
  const nodateText = '-----'
  // this.eventAnalyzer.analyze(result.events, {outputRecords: runOption.outputRecords, period: dates});

  return <>
    {
      result.dates &&
      <Box flexDirection="column">
        <Box flexDirection="row">
          <Text># {moment(_.first(result.dates)).format(`${ymdFormat} ${dayFormat}`)} - {moment(_.last(result.dates)).format(`${ymdFormat} ${dayFormat}`)}</Text>
        </Box>
        {
          runOption.outputSummary &&
          <>
            {
              result.summary.map((categoryGrouped: any, i: number) => (
                <Box key={i} flexDirection="column" paddingTop={1}>
                  <Box>
                    <Text>## {categoryGrouped.category}</Text>
                  </Box>
                  <Box key={categoryGrouped.category} flexDirection="column">
                    {
                      categoryGrouped.aggregated.map((a: any, j: number) => (
                        <Box key={j}>
                          <Box width="18">
                            <Text>{a.key}</Text>
                          </Box>
                          <Box>
                            {
                              a.pattern.type === EventPatternType.MARK &&
                              <>
                                <Text>{a.count} counts</Text>
                              </>
                            }
                            {
                              a.pattern.type !== EventPatternType.MARK &&
                              <>
                                { /* TODO: 右寄せしたい */ }
                                <Text>{formatHour(a.hours) } hours</Text>
                                <Text> (avg {formatHour(a.averageHours) })</Text>
                              </>
                            }
                          </Box>
                        </Box>
                      ))
                    }
                  </Box>
                </Box>
              ))
            }
          </>
        }
        {
          runOption.outputRecords &&
          <>
            {
              (result.targetLogs || []).map((targetLog: DailyLog, i: number) => (
                targetLog.records.map((record: Record, j: number) => (
                  <Box key={j}>
                    <Box width="16">
                      <Text>
                        {
                          record.type === RecordType.TIMELY &&
                          <>
                            {moment(record.datetime).format(`${dateFormat} ${timeFormat} ${dayFormat}`)}
                          </>
                        }
                        {
                          record.type === RecordType.DAILY &&
                          <>
                            {moment(record.datetime).format(`${dateFormat} ${notimeText} ${dayFormat}`)}
                          </>
                        }
                      </Text>
                    </Box>
                    <Text>{record.text}</Text>
                  </Box>
                ))
              ))
            }
          </>
        }
        {
          runOption.outputEvents &&
          <>
            {
              (result.events || []).map((event: Event, i: number) => (
                <Box key={i}>
                  <Text>{event.start ? moment(event.start.datetime).format(`${dateFormat} ${timeFormat}`) : `${nodateText} ${notimeText}`}</Text>
                  <Text>{" to " + moment(event.end.datetime).format(`${dateFormat} ${timeFormat}`) + " "}</Text>
                  <Text>{" ( " + Math.floor(event.elapsed / 1000 / 3600) + " ) "}</Text>
                  <Text>{event.end.text + " "}</Text>
                </Box>
              ))
            }
          </>
        }
        {
          result.moreThan20HoursEvents && result.moreThan20HoursEvents.length > 0 &&
          <>
            {
              (result.moreThan20HoursEvents || []).map((event: Event, i: number) => (
                <Box key={i}>
                  <Text>{event.end.text + " "}</Text>
                  <Text>{" [ "}</Text>
                  <Text>{" from " + (event.start ? moment(event.start.datetime).format(`${dateFormat} ${timeFormat}`) : "--")}</Text>
                  <Text>{" to " + moment(event.end.datetime).format(`${dateFormat} ${timeFormat}`) + " "}</Text>
                  <Text>{" elapsed " + Math.floor(event.elapsed / 1000 / 3600)}</Text>
                  <Text>{" ] "}</Text>
                </Box>
              ))
            }
          </>
        }
        {
          result.outputIsolations && result.outputIsolations.length > 0 &&
          <>
            {
              (result.outputIsolations || []).map((record: Record, i: number) => (
                <Box key={i}>
                  <Box width="26">
                    <Text>{moment(record.datetime).format()}</Text>
                  </Box>
                  <Text>{record.text}</Text>
                </Box>
              ))
            }
          </>
        }
        <Newline></Newline>
        <Text>END</Text>
        <Newline></Newline>
      </Box>
    }
  </>;
};

export default async (runOption: KilogkRunOption, container: Container) => {

  const result: any = {};

  const { unmount, waitUntilExit } = render(<App runOption={runOption} container={container} />);
  return waitUntilExit;

};
