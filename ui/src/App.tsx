import styled, { css } from 'styled-components'

import { Button, Select, Text, Title } from 'react-figma-plugin-ds'
import { Cluster, Loader, Stack } from 'smarthr-ui'
import 'react-figma-plugin-ds/figma-plugin-ds.css'
import { useTextStyles } from './features/bridge/useTextStyles'

export default () => {
  const {
    textStyles,
    actualTargets,
    values,
    setValues,
    converting,
    setConverting,
  } = useTextStyles()

  return (
    <>
      <Wrapper>
        {textStyles &&
          Object.entries(textStyles).map(([type, styles]) => (
            <Stack gap={0}>
              <Title size="xlarge">{type}</Title>
              <ul>
                {styles.map(
                  ({ id, name, default: defaultValue, styles: defaults }) => (
                    <li key={id}>
                      <Cluster>
                        <Text>{name}</Text>
                        <Select
                          options={defaults.map(({ id, name }) => {
                            return {
                              value: id,
                              label: name,
                              title: name,
                            }
                          })}
                          defaultValue={defaultValue}
                          placeholder=""
                          onChange={(e) => {
                            setValues((prevState) => {
                              return { ...prevState, [id]: e.value as string }
                            })
                          }}
                        />
                      </Cluster>
                    </li>
                  ),
                )}
              </ul>
            </Stack>
          ))}
      </Wrapper>
      <BottomArea>
        {actualTargets && <>対象の Text： {actualTargets.length}件</>}
        <Button
          isDisabled={converting}
          onClick={() => {
            setConverting(true)
            parent.postMessage(
              {
                pluginMessage: {
                  type: 'convert',
                  values,
                },
              },
              '*',
            )
          }}
        >
          {converting ? <Loader size="s" type="light" /> : '変換'}
        </Button>
      </BottomArea>
    </>
  )
}

const Wrapper = styled(Stack)(
  ({ theme: { spacingByChar } }) => css`
    padding: ${spacingByChar(1)};
  `,
)
const BottomArea = styled(Cluster).attrs({
  gap: 1,
  align: 'center',
  justify: 'flex-end',
})(
  ({ theme: { color, spacingByChar } }) => css`
    position: sticky;
    bottom: 0;
    background-color: ${color.WHITE};
    padding: ${spacingByChar(1)};
  `,
)
