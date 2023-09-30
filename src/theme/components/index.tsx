import React, {
  forwardRef,
  HTMLProps,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useImperativeHandle,
  useRef,
  useState
} from "react";
import { Link } from "react-router-dom";
import styled, { css, keyframes } from "styled-components";

import { ReactComponent as TooltipTriangle } from "../../assets/svg/tooltip_triangle.svg";

// TODO: Break this file into a components folder

const StyledLink = styled.a`
  text-decoration: none;
  cursor: pointer;
  color: ${({ theme }) => theme.primary1};
  font-weight: 500;

  :hover {
    text-decoration: underline;
  }

  :focus {
    outline: none;
    text-decoration: underline;
  }

  :active {
    text-decoration: none;
  }
`;

export function ExternalLink({
  target = "_blank",
  href,
  rel = "noopener noreferrer",
  ...rest
}: Omit<HTMLProps<HTMLAnchorElement>, "as" | "ref" | "onClick"> & {
  href: string;
}) {
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      // don't prevent default, don't redirect if it's a new tab
      if (target === "_blank" || event.ctrlKey || event.metaKey) {
        //   ReactGA.outboundLink({ label: href }, () => {
        //     console.debug('Fired outbound link event', href)
        //   })
      } else {
        event.preventDefault();
        // send a ReactGA event and then trigger a location change
        //   ReactGA.outboundLink({ label: href }, () => {
        //     window.location.href = href
        //   })
      }
    },
    [href, target]
  );
  return (
    <StyledLink
      target={target}
      rel={rel}
      href={href}
      onClick={handleClick}
      {...rest}
    />
  );
}
