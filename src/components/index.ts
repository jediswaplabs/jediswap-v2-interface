import React from 'react'
import styled from 'styled-components'
import { Box } from 'rebass'


export const Divider = styled(Box)`
  height: 1px;
  background-color: ${({ theme }) => theme.divider};
`