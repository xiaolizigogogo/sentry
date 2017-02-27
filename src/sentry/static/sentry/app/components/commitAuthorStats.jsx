import React from 'react';

import LoadingIndicator from '../components/loadingIndicator';
import LoadingError from '../components/loadingError';
import Avatar from '../components/avatar';

import TooltipMixin from '../mixins/tooltip';
import ApiMixin from '../mixins/apiMixin';

const CommitAuthorStats = React.createClass({
  propTypes: {
    orgId: React.PropTypes.string.isRequired,
    projectId: React.PropTypes.string.isRequired,
    version: React.PropTypes.string.isRequired,
  },

  mixins: [
    ApiMixin,
    TooltipMixin({
      selector: '.tip'
    }),
  ],

  getInitialState() {
    return {
      loading: true,
      error: false,
    };
  },

  componentDidMount() {
    let {orgId, projectId, version} = this.props;
    let path = `/projects/${orgId}/${projectId}/releases/${version}/commits/`;
    this.api.request(path, {
      method: 'GET',
      success: (data, _, jqXHR) => {
        this.setState({
          error: false,
          loading: false,
          commitList: data,
          pageLinks: jqXHR.getResponseHeader('Link')
        });
      },
      error: () => {
        this.setState({
          error: true,
          loading: false
        });
      }
    });
  },

  render() {

    if (this.state.loading)
      return <LoadingIndicator/>;

    if (this.state.error)
      return <LoadingError/>;

    let {commitList} = this.state;

    let commitAuthors = commitList.reduce((_commitAuthors, commit) => {
      let {author} = commit;
      if (!_commitAuthors.hasOwnProperty(author.email)) {
        _commitAuthors[author.email] = {
          commitCount: 1,
          author: author
        };
      }
      else {
        _commitAuthors[author.email].commitCount += 1;
      }
      return _commitAuthors;
    }, {});

    let authorEmails = Object.keys(commitAuthors);
    return (
      <div style={{marginTop: 5}}>
        <h6 className="nav-header m-b-1">Commits by Author</h6>
        <ul className="list-group">
        {authorEmails.map(authorEmail => {
          let {author, commitCount} = commitAuthors[authorEmail];
          return (
            <li className="list-group-item list-group-item-sm ">
              <div className="row">
                <div className="col-sm-8">
                  <div className="tip" title={author.name + ' ' + author.email}>
                    <Avatar user={author} size={32} />
                  </div>
                </div>
                <div className="col-sm-4 align-right">{commitCount} commits</div>
              </div>
            </li>
          );
        })}
        </ul>
      </div>
    );
  }
});

export default CommitAuthorStats;
