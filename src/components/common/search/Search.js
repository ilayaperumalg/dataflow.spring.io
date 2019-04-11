import React from "react"
import PropTypes from "prop-types"
import Link from "gatsby-link"
import { navigate, graphql } from "gatsby"
import get from "lodash.get"
import { cleanPath } from "./../../documentation"

import {
  Highlight,
  Snippet,
  Index,
  Configure,
  connectAutoComplete,
} from "react-instantsearch-dom"
import Autosuggest from "react-autosuggest"

const HitTemplate = ({ hit }) => (
  <Link to={hit.url} className="link">
    <div className={`title`}>
      <Highlight
        attribute="fullTitle"
        hit={hit}
        tagName="mark"
        className="search-result-page blue"
      />
    </div>
    <div className={`html`}>
      <Snippet attribute="html" hit={hit} className="search-result-snippet" />
      ...
    </div>
  </Link>
)

HitTemplate.propTypes = {
  hit: PropTypes.shape({
    url: PropTypes.string.isRequired,
  }).isRequired,
}

class Results extends React.Component {
  state = {
    value: this.props.currentRefinement,
  }

  onChange = (event, { newValue }) => {
    this.setState(() => {
      return { value: newValue }
    })
  }

  onSuggestionsFetchRequested = ({ value }) => {
    this.props.refine(value)
  }

  onSuggestionsClearRequested = () => {
    this.props.refine()
  }

  getSuggestionValue = hit => {
    return hit.title
  }

  renderSuggestion = hit => {
    return <HitTemplate hit={hit} />
  }

  renderSectionTitle = section => {
    return <span className={`section-label`}>{section.title}</span>
  }

  getSectionSuggestions = section => {
    return section.suggestions
  }

  onSuggestionSelected = (e, { suggestion }) => {
    navigate(suggestion.url)
  }

  onInputBlur = () => {
    this.props.onBlur()
  }

  render = () => {
    const hits = this.props.hits
    const pages = this.props.pages

    const suggestions = this.props.pages.edges
      .map(({ node }) => {
        return {
          id: get(node, "frontmatter.path"),
          title: get(node, "frontmatter.title"),
          suggestions: hits.filter(
            hit =>
              cleanPath(hit.category) ===
              cleanPath(get(node, "frontmatter.path"))
          ),
        }
      })
      .filter(item => item.suggestions.length > 0)

    const { value } = this.state
    const inputProps = {
      placeholder: `Search...`,
      onChange: this.onChange,
      value,
      autoFocus: true,
      "data-cy": `search-input`,
      onBlur: this.props.onBlur,
    }

    const inputTheme = `input-control`

    const theme = {
      input: inputTheme,
      inputOpen: inputTheme,
      inputFocused: inputTheme,
      suggestionsContainerOpen: `result`,
      suggestionsList: `list`,
      sectionContainer: `section`,
      sectionTitle: `section-title`,
    }

    return (
      <>
        <Configure hitsPerPage="8" />
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionSelected={this.onSuggestionSelected}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={this.getSuggestionValue}
          renderSuggestion={this.renderSuggestion}
          inputProps={inputProps}
          multiSection={true}
          theme={theme}
          renderSectionTitle={this.renderSectionTitle}
          getSectionSuggestions={this.getSectionSuggestions}
        />
        <Index indexName="Doc" />
      </>
    )
  }
}

Results.propTypes = {
  hits: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
  currentRefinement: PropTypes.string.isRequired,
  refine: PropTypes.func.isRequired,
}

const AutoComplete = connectAutoComplete(Results)

export default AutoComplete
