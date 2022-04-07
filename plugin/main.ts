const styleKeys = [
  'eae4dcde1daed24a72bbe25f5a138d10d8d7251a',
  'c600b1c2ffcb68813cebaf29b48372142970d120',
  'c2b2cdd1bba43b7c69bbce01b8863dde05e5cf11',
  'baae08b4704885f30e9df0e45a8357f514c10ac9',
  'acf6cbeba9efc675987b589515f9cb0350d8fc76',
  '990ba5c301cd76cda3b770a2ce60e3a56de208b8',
  '986d0dc67c7fe319b74f66658202e5748f88dedc',
  '9682eaad57129b4017f90c4ba37352752723ba63',
  '8ebb17420c331a683ee24499c15473ee40e5fd7a',
  '765bbfa18ff9d276c2366e35f85e2a71ec61b789',
  '61fb3053a70510f2754769db422da3ee6444dac2',
  '4e397349ca79e45c066129d7387ee8d047f235b2',
  '487c9cda263319ebe48839877f289c9b9ebd5938',
  '433206e292b51a4c373edbb9665f7866755b0abd',
  '378380d382bf90397c8f45d2ec6a4166743308c7',
  '3605e7285004148260fdd874bcff5e5b1858b040',
  '0fefeb072c8db6ceb88bd46b873093cd63cfa631',
  'e874c8aca59f4b80642d4715ad4dccd54b18029b',
  'b33d867be220df6487184025cb8680355bf1a0f1',
  '83d83508c7251a050c11e297d734f9423ab4f5af',
  '7e26e4848e365663e7e2d2ec4aa94602ea24bed6',
  '28c4ff1cc82f4e9d7700d6b5f961053fbbc7483f',
  '110e86cbfca27a285ecbc68d823708515753ee24',
] as const

const getStyles = async () =>
  await Promise.all(styleKeys.map((key) => figma.importStyleByKeyAsync(key)))
const main = async () => {
  const styles = (await getStyles()) as TextStyle[]

  figma.ui.postMessage({
    type: 'initialize',
    target: getUITarget(),
    styles: styles.map((style) => {
      return {
        id: style.id,
        name: style.name,
      }
    }),
  })
}

main()
figma.showUI(__html__, {
  width: 500,
  height: 500,
})

figma.on('selectionchange', () =>
  figma.ui.postMessage({
    type: 'selectionchange',
    target: getUITarget(),
  }),
)

figma.ui.onmessage = (msg) => {
  if (msg.type === 'convert') {
    const convertMap: { [updateId: string]: string } = msg.values
    const targetNodes = extractTarget().filter(
      (node) => !!convertMap[(node as TextNode).textStyleId as string],
    ) as TextNode[]

    targetNodes.forEach((node, i) => {
      const styleId = convertMap[node.textStyleId as string]
      if (styleId) {
        node.textStyleId = styleId
      }
    })

    figma.ui.postMessage({
      type: 'converted',
      convertedCount: targetNodes.length,
      target: getUITarget(),
    })
    figma.notify(`${targetNodes.length}件を変換しました。`)
  }
}

const extractTarget = () =>
  figma.currentPage.selection.length > 0
    ? figma.currentPage.selection
        .flatMap((node) => traverse(node))
        .filter(extractTextNode)
    : figma.currentPage.findAll(extractTextNode)
const getUITarget = () =>
  // Cannot unwrap symbol というエラーがか出たので JSON 化してる
  JSON.stringify(
    extractTarget().map((node) => {
      const { id, textStyleId } = node as TextNode
      return {
        id,
        textStyleId,
      }
    }),
  )
const traverse = (node: BaseNode): SceneNode[] => {
  if ('children' in node) {
    return node.children.flatMap((node) => {
      if (node.type === 'TEXT') {
        return node
      } else {
        return traverse(node)
      }
    })
  } else if (node.type === 'TEXT') {
    return [node]
  } else {
    return []
  }
}
const extractTextNode = (node: SceneNode) => node.type === 'TEXT'
