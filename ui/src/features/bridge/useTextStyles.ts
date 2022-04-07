import { useState, useEffect } from 'react'

type TargetNode = {
  id: string
  textStyleId: string | symbol
}

type Style = {
  id: string
  name: string
  default: string
  styles: TextStyle[]
}

type Message = {
  data: {
    pluginMessage:
      | {
          type: 'initialize'
          target: string
          styles: TextStyle[]
        }
      | {
          type: 'selectionchange'
          target: string
        }
      | {
          type: 'converted'
          convertedCount: number
          target: string
        }
  }
}

const replaceSizeToNumber = (name: string) =>
  name
    .replace(/Legacy/, '1')
    .replace(/Default/, '2')
    .replace(/Heading/, '1')
    .replace(/Body/, '2')
    .replace(/Label/, '3')
    .replace(/Normal/, '1')
    .replace(/Bold/, '2')
    .replace(/XXS/g, '1')
    .replace(/XS/g, '2')
    .replace(/S/g, '3')
    .replace(/M/g, '4')
    .replace(/L/g, '5')
    .replace(/XL/g, '6')
    .replace(/XXL/g, '7')

export const useTextStyles = () => {
  const [targetNodes, setTargetNodes] = useState<TargetNode[]>()
  const [actualTargets, setActualTargets] = useState<TargetNode[]>()
  const [textStyles, setTextStyles] = useState<{
    [type: string]: Style[]
  }>()
  const [values, setValues] = useState<{ [key: string]: string }>({})
  const [converting, setConverting] = useState<boolean>(false)

  useEffect(() => {
    window.onmessage = ({ data: { pluginMessage } }: Message) => {
      const { type } = pluginMessage
      switch (type) {
        case 'initialize': {
          const { styles, target } = pluginMessage
          const sortedStyles = styles.sort(
            ({ name: nameA }, { name: nameB }) => {
              nameA = replaceSizeToNumber(nameA)
              nameB = replaceSizeToNumber(nameB)
              return nameA < nameB ? -1 : 1
            },
          )

          const { Legacy: legacyStyles, Default: defaultStyles } =
            Object.entries(
              styles.reduce<{
                [category: string]: TextStyle[]
              }>((group, style) => {
                const { 0: category } = /Legacy|Default/.exec(style.name)!
                group[category] = group[category] ?? []
                group[category].push(style)
                return group
              }, {}),
            ).reduce<{
              [category: string]: {
                [type: string]: TextStyle[]
              }
            }>((map, [category, styles]) => {
              map[category] = styles.reduce<{ [type: string]: TextStyle[] }>(
                (group, style) => {
                  const { 0: type } = /Heading|Body|Label/.exec(style.name)!
                  group[type] = group[type] ?? []
                  group[type].push(style)
                  return group
                },
                {},
              )
              return map
            }, {})

          const initial = Object.entries(legacyStyles).reduce<{
            [type: string]: Style[]
          }>((group, [type, styles]) => {
            group[type] = styles.map(({ id, name }) => {
              const target = name.replace('Legacy(14px)/', '')
              const item = defaultStyles[type].find(({ name }) =>
                name.endsWith(target),
              )!

              return {
                id,
                name,
                default: item.id,
                styles: defaultStyles[type],
              }
            })

            return group
          }, {})

          setTargetNodes(JSON.parse(target))
          setTextStyles(initial)
          break
        }
        case 'selectionchange': {
          const { target } = pluginMessage
          setTargetNodes(JSON.parse(target))
          break
        }
        case 'converted': {
          const { target } = pluginMessage
          setTargetNodes(JSON.parse(target))
          setConverting(false)
          break
        }
      }
    }
  }, [])

  useEffect(() => {
    if (targetNodes && values) {
      const filteredTargets = targetNodes.filter(
        (node) => !!values[node.textStyleId as string],
      )
      setActualTargets(filteredTargets)
    }
  }, [targetNodes, values])

  return {
    textStyles,
    actualTargets,
    values,
    setValues,
    converting,
    setConverting,
  }
}
