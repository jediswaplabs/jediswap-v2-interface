import React from 'react'
import styled from 'styled-components'

const FeeBadgeContainer = styled.div`
  display: inline-flex;
  padding: 4px 8px;
  border-radius: 4px;
  background: #444;
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
`

const FeeBadge = ({ children}: {children: string}) => <FeeBadgeContainer>{children}</FeeBadgeContainer>

export default FeeBadge
