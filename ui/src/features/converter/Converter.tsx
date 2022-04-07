type Props = {
  textStyles: TextStyle[]
}
export const Converter = ({ textStyles }: Props) => {
  const { Legacy: legacyStyles, Default: defaultStyles } = textStyles.reduce<{
    [category: string]: TextStyle[]
  }>((group, style) => {
    const { 0: category } = /Legacy|Default/.exec(style.name)!
    group[category] = group[category] ?? []
    group[category].push(style)
    return group
  }, {})

  const styles = legacyStyles.map((style) => {
    const target = style.name.replace('Legacy(14px)/', '')
    const item = defaultStyles.find(({ name }) => name.endsWith(target))

    return (
      item && {
        ...style,
        default: item.id,
      }
    )
  })

  // products.reduce((group, product) => {
  //   const { category } = product;
  //   group[category] = group[category] ?? [];
  //   group[category].push(product);
  //   return group;
  // }, {});

  return null
}
